const BaseCommand = require('./base');
const colors = require('colors');
const request = require('superagent');
const HttpStatus = require('http-status-codes');
const path = require('path');
const fs = require('fs-extra');

module.exports = class Command extends BaseCommand {
  constructor(cli, isPull) {
    super(cli);
    this.isPull = isPull;
  }

  async execute() {
    // check snapdev root
    this.cli.checkSnapdevRoot();
    // check login
    await this.cli.checkLogin();

    let templateName;
    let action;
    let cloneVersion = 'latest';

    if (this.cli.program.version) {
      cloneVersion = this.cli.program.version;
    }

    let { branch, templateId } = await this.cli.getTemplateContext(
      false,
      false
    );

    if (!this.isPull) {
      // clone request
      action = 'Cloning';
      templateName = this.cli.program.template;
    } else {
      // pull request
      action = 'Pulling';
      templateName = branch;
    }

    // check full template name
    if (!this.cli.isValidFullTemplateName(templateName)) {
      // default to current user
      templateName = this.cli.username.concat('/', templateName);
    }

    let newTemplateLocation = path.join(this.cli.templateFolder, templateName);

    // check if location is empty
    if (fs.existsSync(newTemplateLocation) && !this.cli.program.force) {
      console.log(
        colors.yellow(
          'The destination location is not empty, add --force to override'
        )
      );
      process.exit(1);
    } else {
      if (!this.cli.program.silent) {
        console.log(
          colors.yellow(
            'Overriding the destination directory as per the --force flag'
          )
        );
      }
    }

    // download zip file
    const tempFile = await this.cli.makeTempFile();
    let distZipFile = tempFile + '.zip';

    console.log(action, 'template....');
    const cred = await this.cli.getCredentials();

    // validate if the user has access to the template
    let pulledVersion;
    let pulledTags;
    let pulledPrivate;
    let pulledDescription;
    let pulledPushId;
    let pulledTemplateId;
    try {
      const response = await request
        .post(this.cli.templatesAPI + '/prepull')
        .set('Authorization', `Bearer ${cred.token}`)
        .send({
          name: templateName,
          version: cloneVersion,
        });

      pulledVersion = response.body.data.version;
      pulledTags = response.body.data.tags;
      pulledPrivate = response.body.data.isPrivate;
      pulledDescription = response.body.data.description;
      pulledPushId = response.body.data.pushId;
      pulledTemplateId = response.body.data.id;

      // set templateId
      if (!templateId || templateId === '') {
        templateId = pulledTemplateId;
      }
      // set pushId
      await this.cli.setPushId(templateId, pulledPushId);
    } catch (err) {
      if (err.status === HttpStatus.BAD_REQUEST) {
        console.log(colors.yellow(err.response.body.error.message));
      } else if (err.status === HttpStatus.NOT_FOUND) {
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

    // delete the old folder
    if (fs.existsSync(newTemplateLocation)) {
      await fs.remove(newTemplateLocation);
    }

    try {
      // download zip file
      await this.cli.downloadZip(
        cred.token,
        templateName,
        cloneVersion,
        distZipFile
      );

      // console.log('Zip File:', distZipFile);
      // console.log('Zip size:', this.cli.getFilesizeInBytes(distZipFile));

      console.log(
        'Download size:',
        this.cli.getFilesizeInBytes(distZipFile),
        'bytes'
      );
      // extract zip file
      console.log('Clone location:', newTemplateLocation);
      // console.log('Zip file:', distZipFile);
      try {
        this.cli.extractZip(distZipFile, newTemplateLocation);
      } catch (error) {
        console.log(colors.yellow('Unable to extract template:', error));
        process.exit(1);
      }
      // console.log('Clone Succeeded');

      console.log('Version:', pulledVersion);

      // switch branch context
      await this.cli.switchContextBranch(templateName);

      // set templateId
      let { templateJSONFile } = await this.cli.getTemplateContext(
        false,
        false
      );
      await this.cli.updateJSON(templateJSONFile, {
        version: pulledVersion,
        tags: pulledTags,
        private: pulledPrivate,
        description: pulledDescription,
        templateId,
      });
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
