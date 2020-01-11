const path = require('path');
const fs = require('fs-extra');
const colors = require('colors');
const mustache = require('mustache');
const validator = require('validator');
const helpers = require('../helpers');
const Generator = require('./Generator');
const json = require('json-update');
const semver = require('semver');
const config = require('config');
const homePath = require('home-path');
const request = require('superagent');
const archiver = require('archiver');
const tmp = require('tmp-promise');

/**
 * The CLI is the main class to the commands executed on the command line
 * snapdev will follow a similar approach to GIT commands
 * =====local=====
 * initialise snapdev
 *      $ snapdev init
 * get snapdev status
 *      $ snapdev status
 * create or switch to a template
 *      $ snapdev checkout java-app
 * create model
 *      $ snapdev add model.json
 * generate source code
 *      $ snapdev generate --clear
 *      $ snapdev generate User.json --clear
 *
 * =====online=====
 * login
 *      $ snapdev login
 * logout
 *      $ snapdev logout
 * tag
 *      $ snapdev tag --user --version 1.1.0 --name nodejs
 * clone (download template)
 *      $ snapdev clone tptshepo/java-app --version 1.1
 * push (upload template)
 *      $ snapdev push
 *
 */

class CLI {
  constructor(program, version) {
    this.program = program;
    this.version = version;
    this.currentLocation = process.cwd();
    this.templateFolder = path.join(this.currentLocation, 'templates');
    this.starterFolder = path.normalize(path.join(__dirname, '..', 'starters'));
    this.distFolder = path.join(this.currentLocation, 'dist');
    this.snapdevHome = path.join(homePath(), '.snapdev');
    this.credentialFile = path.join(this.snapdevHome, 'credentials');

    // rules
    this.shortTemplateNameRule = '^[a-z][a-z0-9-_]*$';
    this.fullTemplateNameRule = '^[a-z][a-z0-9-_]*[/][a-z0-9-_]*$';

    // starters
    this.starterModelFile = path.join(this.starterFolder, 'model.json');
    this.starterSnapdevFile = path.join(this.starterFolder, 'snapdev.json');
    this.starterTemplateJsonFile = path.join(
      this.starterFolder,
      'template.json'
    );
    this.starterReadMeFile = path.join(this.starterFolder, 'README.md');
    this.starterSampleTemplateFile = path.join(
      this.starterFolder,
      '{{titlecase}}.java.txt'
    );

    this.mustacheModel = {
      version: this.version
    };
    // API
    this.snapdevHost = config.snapdevHost;
    this.usersAPI = config.snapdevHost + config.usersAPI;
    this.templatesAPI = config.snapdevHost + config.templatesAPI;
  }

  zipDirectory(sourceDir, distZipFile) {
    const archive = archiver('zip', { zlib: { level: 9 } });
    const stream = fs.createWriteStream(distZipFile);

    return new Promise((resolve, reject) => {
      archive
        .directory(sourceDir, false)
        .on('error', err => reject(err))
        .pipe(stream);

      stream.on('close', () => resolve());
      archive.finalize();
    });
  }

  async push() {
    // check for snapdev root
    this.checkSnapdevRoot();

    // check for login
    await this.checkLogin();

    // check for valid template version
    let {
      templateFolder,
      templateVersion,
      branch
    } = await this.getTemplateContext();
    if (semver.valid(templateVersion) === null) {
      console.log(
        colors.yellow(
          'Invalid template version. Please run [snapdev tag --version x.y.z]'
        )
      );
      process.exit(1);
    }

    // template must be tagged with user
    await this.checkTagged();

    // zip template folder
    const tempFile = await this.makeTempFile();
    let distZipFile = tempFile + '.zip';
    // console.log('Zip File:', distZipFile);

    try {
      await this.zipDirectory(templateFolder, distZipFile);
      // console.log('Zip file created');
    } catch (e) {
      console.log(colors.yellow('Unable to create zip file'), colors.yellow(e));
      process.exit(1);
    }

    // upload template
    console.log('Pushing...');
    try {
      const cred = await this.getCredentials();
      const response = await request
        .post(this.templatesAPI + '/push')
        .set('Authorization', `Bearer ${cred.token}`)
        .field('name', branch)
        // .field('tags', 'node,js')
        .attach('template', distZipFile);
      console.log('Push Succeeded');
    } catch (err) {
      if (err.status === 400) {
        const jsonError = JSON.parse(err.response.res.text);
        console.log(colors.yellow(jsonError.error.message));
      } else {
        console.log(colors.yellow(err.message));
      }
    }

    return true;
  }

  async isLoggedIn() {
    const cred = await this.getCredentials();
    if (cred) {
      if (cred.token !== '') {
        return true;
      }
    }
    return false;
  }

  async relogin() {
    console.log('Authenticating with existing credentials...');

    // call get me API
    try {
      const cred = await this.getCredentials();

      const response = await request
        .get(this.usersAPI + '/me')
        .set('Authorization', `Bearer ${cred.token}`)
        .send();
      console.log('Login Succeeded');
    } catch (err) {
      console.log(colors.yellow(err.message));
    }

    return true;
  }

  async logout() {
    // call logout API
    try {
      const cred = await this.getCredentials();

      const response = await request
        .post(this.usersAPI + '/logout')
        .set('Authorization', `Bearer ${cred.token}`)
        .send();

      await this.updateJSON(this.credentialFile, {
        username: '',
        token: ''
      });
      console.log('Removed login credentials');
    } catch (err) {
      console.log(colors.yellow(err.message));
    }

    return true;
  }

  async login() {
    console.log('');
    // console.log('Host:', config.snapdevAPI);
    // console.log('Username:', this.program.username);
    // console.log('Password:', this.program.password);

    // create a ~/.snapdev/credentials
    if (!fs.existsSync(this.snapdevHome)) {
      fs.mkdirSync(this.snapdevHome, { recursive: true });
    }

    // call login API
    try {
      const response = await request.post(this.usersAPI + '/login').send({
        username: this.program.username,
        password: this.program.password
      });
      await this.updateJSON(this.credentialFile, {
        username: this.program.username,
        token: response.body.data.token
      });
      console.log('Login Succeeded');
    } catch (err) {
      if (err.status === 400) {
        console.log(
          colors.yellow('Unauthorized: incorrect username or password')
        );
      } else {
        console.log(colors.yellow(err.message));
      }
    }
    return true;
  }

  init() {
    // create folders if not found
    if (!fs.existsSync(this.templateFolder)) {
      fs.mkdirSync(this.templateFolder, { recursive: true });
    }

    let newSnapdevFile = path.join(this.currentLocation, 'snapdev.json');
    return this.copyStarter(
      this.starterSnapdevFile,
      newSnapdevFile,
      this.mustacheModel
    );
  }

  async status() {
    this.checkSnapdevRoot();
    let {
      branch,
      templateFolder,
      username,
      templateVersion
    } = await this.getTemplateContext();
    console.log('Logged in as:', username);
    console.log('Template name:', branch);
    console.log('Template version:', templateVersion);
    console.log('Template root:', templateFolder);
    return true;
  }

  async tag() {
    this.checkSnapdevRoot();
    let {
      templateFolder,
      username,
      templateVersion,
      templateJSONFile,
      branch
    } = await this.getTemplateContext();

    /**============================ */
    // set version
    /**============================ */
    if (this.program.version !== undefined) {
      let version = this.program.version;
      if (semver.valid(version) === null) {
        console.log(
          colors.yellow(
            'Invalid version number format. Please use the https://semver.org/ specification'
          )
        );
        process.exit(1);
      }
      // update template.json
      const updated = await this.updateJSON(templateJSONFile, {
        version: version
      });
      if (updated) {
        console.log(branch, 'set to version', version);
      }
    }

    /**============================ */
    // set name
    /**============================ */
    if (this.program.name !== undefined) {
      let newName = this.program.name;
      // make sure it's a short name
      if (!validator.matches(newName, this.shortTemplateNameRule)) {
        console.log(colors.yellow('Invalid template name.'));
        process.exit(1);
      }

      let newBranch;
      if (branch.indexOf('/') > -1) {
        // has username
        let user = branch.split('/')[0];
        newBranch = user + '/' + newName;
      } else {
        // no username
        newBranch = newName;
      }

      let newTemplateLocation = path.join(this.templateFolder, newBranch);
      let oldTemplateLocation = templateFolder;

      // console.log('OLD BRANCH:', branch);
      // console.log('OLD LOCATION:', oldTemplateLocation);
      // console.log('NEW BRANCH:', newBranch);
      // console.log('NEW LOCATION:', newTemplateLocation);

      if (fs.existsSync(newTemplateLocation)) {
        console.log(
          colors.yellow(
            'Template name already exists at that location.',
            newTemplateLocation
          )
        );
        process.exit(1);
      } else {
        // fs.mkdirSync(newTemplateLocation, { recursive: true });
      }

      // rename folder
      try {
        // move template into the user folder
        await fs.move(oldTemplateLocation, newTemplateLocation);
        console.log('From:', oldTemplateLocation);
        console.log('To:', newTemplateLocation);

        // update template context fields
        templateJSONFile = path.join(newTemplateLocation, 'template.json');
        templateFolder = path.join(this.templateFolder, newBranch);

        const updated = await this.updateJSON(templateJSONFile, {
          name: newName
        });

        // update context branch
        await this.switchContextBranch(newBranch);

        branch = newBranch;
      } catch (err) {
        console.log(colors.yellow('Unable to rename template', err));
      }
    }

    /**============================ */
    // tag with a user
    /**============================ */
    if (this.program.user) {
      const loggedIn = await this.isLoggedIn();
      if (!loggedIn) {
        console.log(
          colors.yellow(
            'Please run [snapdev login] to tag a template with a user'
          )
        );
        process.exit(1);
      }

      const valid = this.validUsername(username);
      if (valid) {
        if (branch.indexOf('/') > -1) {
          // console.log(colors.yellow('Template already tagged with a user.'));
          // console.log('Tagged');
          console.log('Tagged', branch);
        } else {
          // no user for template, move template into a user folder
          const userFolder = path.join(this.templateFolder, username);
          if (!fs.existsSync(userFolder)) {
            // user folder not found
            fs.mkdirSync(userFolder, { recursive: true });
          } else {
            // user folder found
          }

          const newTemplateFolder = path.join(userFolder, branch);
          if (fs.existsSync(newTemplateFolder)) {
            console.log(
              colors.yellow('Tag destination already exists', newTemplateFolder)
            );
            process.exit(1);
          }

          try {
            // move template into the user folder
            await fs.move(templateFolder, newTemplateFolder);
            console.log('From:', templateFolder);
            console.log('To:', newTemplateFolder);

            // update context branch
            await this.switchContextBranch(username + '/' + branch);
          } catch (err) {
            console.log(colors.yellow('Unable to move template', err));
          }
        }
      }
    }

    return true;
  }

  async checkout() {
    this.checkSnapdevRoot();

    // validate template name against short and full name

    let templateName;
    if (this.program.template.indexOf('/') > -1) {
      // username/template-name
      if (
        !validator.matches(this.program.template, this.fullTemplateNameRule)
      ) {
        console.log(colors.yellow('Invalid template name.'));
        return false;
      }
      templateName = this.program.template.split('/')[1];
    } else {
      // template-name
      if (
        !validator.matches(this.program.template, this.shortTemplateNameRule)
      ) {
        console.log(colors.yellow('Invalid template name.'));
        return false;
      }
      templateName = this.program.template;
    }

    // get new folder name
    let newTemplateFolder = path.join(
      this.templateFolder,
      this.program.template
    );
    let srcFolder = path.join(newTemplateFolder, 'src');
    if (!fs.existsSync(srcFolder)) {
      if (!this.program.create) {
        console.log(colors.yellow('Template not found.'));
        process.exit(1);
      }

      fs.mkdirSync(srcFolder, { recursive: true });

      // save template.json in the folder
      this.copyStarter(
        this.starterTemplateJsonFile,
        path.join(newTemplateFolder, 'template.json'),
        {
          name: templateName,
          version: '0.0.1'
        }
      );

      // copy readme file
      this.copyStarter(
        this.starterReadMeFile,
        path.join(newTemplateFolder, 'README.md'),
        {
          name: templateName
        }
      );

      // copy template sample file
      this.copyStarter(
        this.starterSampleTemplateFile,
        path.join(newTemplateFolder, 'src', '{{titlecase}}.java.txt'),
        null
      );

      // create models folder
      let modelFolder = path.join(newTemplateFolder, 'models');
      if (!fs.existsSync(modelFolder)) {
        fs.mkdirSync(modelFolder, { recursive: true });
      }

      // create sample models file
      this.copyStarter(
        this.starterModelFile,
        path.join(modelFolder, 'default.json')
      );
    }

    // switch context
    await this.switchContextBranch(this.program.template);

    return true;
  }

  async switchContextBranch(branch) {
    const updated = await this.updateJSON('snapdev.json', {
      branch
    });
    if (updated) {
      console.log('Switched to', branch);
    }
  }

  async updateJSON(filename, jsonObject) {
    try {
      await json.update(filename, jsonObject);
      return true;
    } catch (error) {
      console.log(
        colors.yellow('Unable to modify json file:', filename, error)
      );
    }
    return false;
  }

  async getCredentials() {
    if (fs.existsSync(this.credentialFile)) {
      const cred = await this.readJSON(this.credentialFile);
      return cred;
    }
    return null;
  }

  readJSON(filename) {
    return new Promise((resolve, reject) => {
      json.load(filename, function(error, data) {
        if (error) {
          reject(error);
        }
        resolve(data);
      });
    });
  }

  async getTemplateContext() {
    const snapdevData = await this.readJSON('snapdev.json');
    const branch = snapdevData.branch;

    const cred = await this.getCredentials();
    let username = '';
    if (cred) {
      username = cred.username;
    }

    let templateFolder = path.join(this.templateFolder, branch);
    if (!fs.existsSync(path.join(templateFolder, 'template.json'))) {
      console.log(colors.yellow('template.json not found'));
      process.exit(1);
    }

    /// get template details
    const templateJSONFile = path.join(templateFolder, 'template.json');
    const templateData = await this.readJSON(templateJSONFile);
    const templateVersion = templateData.version;

    let templateSrcFolder = path.join(templateFolder, 'src');
    if (!fs.existsSync(templateSrcFolder)) {
      console.log(
        colors.yellow(
          'Invalid template context. Please use [snapdev checkout <template>] to switch to a valid template.'
        )
      );
      process.exit(1);
    }

    return {
      templateFolder,
      templateSrcFolder,
      templateVersion,
      username,
      templateJSONFile,
      branch
    };
  }

  async add() {
    this.checkSnapdevRoot();

    const { templateFolder } = await this.getTemplateContext();

    // validate the file extension
    let newModelFile = path.join(templateFolder, 'models', this.program.model);
    const ext = path.extname(newModelFile);
    if (ext !== '.json') {
      if (ext !== '') {
        console.log(colors.yellow('Invalid file extension.'));
        process.exit(1);
      } else {
        newModelFile += '.json';
      }
    }
    // console.log('Creating Model:', newModelFile);

    // create the parent folder for the model.json
    let parentFolder = path.dirname(newModelFile);
    // console.log('parentFolder', parentFolder);
    if (!fs.existsSync(parentFolder)) {
      fs.mkdirSync(parentFolder, { recursive: true });
    }

    // copy the file
    return this.copyStarter(this.starterModelFile, newModelFile);
  }

  async generate() {
    // make sure we are in snapdev root folder
    this.checkSnapdevRoot();

    let {
      branch,
      templateFolder,
      templateSrcFolder
    } = await this.getTemplateContext();

    if (this.program.clear) {
      // clean dist folder
      helpers.cleanDir(this.distFolder);
    }

    console.log('Template root:', templateFolder);
    console.log('Template src:', templateSrcFolder);
    console.log('Template name:', branch);

    let modelName;
    if (this.program.model !== '') {
      modelName = this.program.model;
    } else {
      modelName = 'default.json';
    }
    // find the model file
    let modelFile = path.join(templateFolder, 'models', modelName);
    console.log('Model filename:', modelFile);
    if (!fs.existsSync(modelFile)) {
      const ext = path.extname(modelFile);
      if (ext === '') {
        modelFile += '.json';
      }
      if (!fs.existsSync(modelFile)) {
        console.log(colors.yellow('Model filename not found'));
        process.exit(1);
      }
    }

    const ext = path.extname(modelFile);
    if (ext !== '.json') {
      console.log(colors.yellow('Invalid model file extension.'));
      process.exit(1);
    }

    // generate code
    const generator = new Generator(
      templateSrcFolder,
      modelFile,
      this.distFolder,
      this.program.verbose
    );
    generator.generate();

    return true;
  }

  validUsername(username) {
    const usernameRule = '^[a-z][a-z0-9-_]*$';
    if (!validator.matches(username, usernameRule)) {
      console.log(colors.yellow('Invalid username format.'));
      return false;
    }
    return true;
  }

  inRoot() {
    const snapdevFile = path.join(this.currentLocation, 'snapdev.json');
    return fs.existsSync(snapdevFile);
  }

  inTemplate() {
    const templateFile = path.join(this.currentLocation, 'template.json');
    return fs.existsSync(templateFile);
  }

  async checkTagged(exit = true) {
    let { branch } = await this.getTemplateContext();
    if (branch.indexOf('/') === -1) {
      console.log(
        colors.yellow(
          'Please run [snapdev tag --user] to tag the template with the logged in user.'
        )
      );
      if (exit) {
        process.exit(1);
      } else {
        return false;
      }
    }

    return true;
  }

  async checkLogin(exit = true) {
    const loggedIn = await this.isLoggedIn();
    if (!loggedIn) {
      console.log(colors.yellow('Please run [snapdev login] to log in.'));
      if (exit) {
        process.exit(1);
      } else {
        return false;
      }
    }

    return true;
  }

  checkSnapdevRoot(exit = true) {
    if (!this.inRoot()) {
      if (exit) {
        console.log(
          colors.yellow('Please run command from same location as snapdev.json')
        );
        process.exit(1);
      } else {
        return false;
      }
    }
    return true;
  }

  checkTemplateRoot(exit = true) {
    if (!this.inTemplate()) {
      if (exit) {
        console.log(
          colors.yellow(
            'Please run command from the template folder that has the template.json file'
          )
        );
        process.exit(1);
      } else {
        return false;
      }
    }
    return true;
  }

  copyStarter(fromFile, toFile, mustacheModel = {}) {
    // get starter model content
    let modelStarterData = fs.readFileSync(fromFile, 'utf8');
    let mergedData;

    if (mustacheModel !== null) {
      mergedData = mustache.render(modelStarterData, mustacheModel);
    } else {
      mergedData = modelStarterData;
    }

    // create the new file if not found
    if (!fs.existsSync(toFile)) {
      try {
        fs.writeFileSync(toFile, mergedData);
        console.log('Created:', toFile);
      } catch (e) {
        console.log(colors.yellow('Unable to create file'), colors.yellow(e));
        process.exit(1);
      }
    } else {
      console.log(colors.yellow('The specified file already exists.'));
      process.exit(1);
    }
    return true;
  }

  async makeTempFile() {
    const o = await tmp.file();
    // console.log(o);
    return o.path;
  }
}

module.exports = CLI;
