const semverInc = require('semver/functions/inc');
const semver = require('semver');
const colors = require('colors');
const request = require('superagent');
const HttpStatus = require('http-status-codes');
const BaseCommand = require('./base');

module.exports = class Command extends BaseCommand {
  constructor(cli) {
    super(cli);
  }

  async execute() {
    // check for snapdev root
    this.cli.checkSnapdevRoot();

    // check for login
    await this.cli.checkLogin();

    // check for valid template version
    let {
      templateFolder,
      templateVersion,
      branch,
      templateJSONFile,
      templatePrivate,
      templateTags,
      templateDescription,
      templateSchemaDef,
      pushId,
      templateId,
    } = await this.cli.getTemplateContext(true, true);

    if (semver.valid(templateVersion) === null) {
      console.log(colors.yellow('Invalid template version. Please run snapdev tag e.g. snapdev tag --version 1.2.3'));
      process.exit(1);
    }

    // template must be tagged with user
    await this.cli.checkTagged();

    // auto version bump
    let newVersion = templateVersion;
    if (this.cli.program.version) {
      newVersion = this.cli.program.version;
      if (semver.valid(newVersion) === null) {
        console.log(colors.yellow('Invalid version number format. Please use the https://semver.org/ specification'));
        process.exit(1);
      }
      // update template.json
      await this.cli.updateJSON(templateJSONFile, {
        version: semver.clean(newVersion),
      });
      console.log('Version set to', newVersion);
    } else {
      // if (this.cli.program.force) {
      newVersion = semverInc(templateVersion, 'patch');
      // save back to template file
      const updated = await this.cli.updateJSON(templateJSONFile, {
        version: semver.clean(newVersion),
      });
      if (updated) {
        console.log('Version set to', newVersion);
      }
      // }
    }

    // zip template folder
    const tempFile = await this.cli.makeTempFile();
    const distZipFile = `${tempFile}.zip`;

    try {
      await this.cli.zipDirectory(templateFolder, distZipFile);
    } catch (e) {
      console.log(colors.yellow('Unable to create zip file'), colors.yellow(e));
      process.exit(1);
    }

    // upload template
    // console.log(branch, newVersion, templatePrivate, templateTags);
    console.log('Pushing...');
    console.log('Upload size:', this.cli.getFilesizeInBytes(distZipFile), 'bytes');
    try {
      const cred = await this.cli.getCredentials();
      // console.log('$$$$',pushId);
      const response = await request
        .post(`${this.cli.templatesAPI}/push`)
        .set('Authorization', `Bearer ${cred.token}`)
        .field('name', branch)
        .field('description', templateDescription)
        .field('schemaDef', JSON.stringify(templateSchemaDef))
        .field('version', newVersion)
        .field('private', templatePrivate)
        .field('pushId', pushId)
        .field('tags', templateTags.join(','))
        .attach('template', distZipFile);

      // set templateId
      if (!templateId || templateId === '') {
        templateId = response.body.data.template.id;
        await this.cli.updateJSON(templateJSONFile, {
          templateId,
        });
      }
      // set pushId
      await this.cli.setPushId(templateId, response.body.data.template.pushId);

      console.log('Push Succeeded');
    } catch (err) {
      if (err.status === HttpStatus.BAD_REQUEST) {
        console.log(colors.yellow(err.response.body.error.message));
      } else if (err.status === HttpStatus.UNAUTHORIZED) {
        console.log(colors.yellow('Session expired'));
        this.cli.program.force = true;
        await this.cli.logout();
      } else {
        console.log(colors.yellow(err.message));
      }
      process.exit(1);
    }

    return true;
  }
};
