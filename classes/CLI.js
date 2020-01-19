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
const AdmZip = require('adm-zip');
const chalk = require('chalk');
const columns = require('cli-columns');
const ModelManager = require('./ModelManager');
const TemplateManager = require('./TemplateManager');
const inquirer = require('inquirer');

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
 *      $ snapdev generate --all
 *      $ snapdev generate User.json --clear
 *
 * =====online=====
 * login
 *      $ snapdev login
 * logout
 *      $ snapdev logout
 * tag
 *      $ snapdev tag --user --version 1.1.0 --name nodejs
 *      $ snapdev tag --private
 *      $ snapdev tag --public
 * clone/pull (download template)
 *      $ snapdev clone tptshepo/java-app --force
 * push (upload template)
 *      $ snapdev push
 * list
 *      $ snapdev list
 * deploy
 *      $ snapdev deploy
 * delete
 *      $ snapdev delete <template> --remote
 * TODO:
 *      $ snapdev tag --keywords "node, api, help"
 *      $ snapdev clone tptshepo/java-app --version 1.2.3
 *      $ snapdev clone tptshepo/java-app --fork
 *
 * 03 Forbidden - PUT https://registry.npmjs.org/snapdev - You cannot publish over the previously published versions: 1.5.6.
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
    //Auth
    this.username = '';
    this.token = '';
    this.cred = null;
  }

  async preDelete() {
    let templateName = this.program.template;

    const input = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'canDelete',
        message: `Are you sure you want to delete ${templateName}`
      }
    ]);

    if (!input.canDelete) {
      process.exit(1);
    }
  }

  async delete() {
    this.checkSnapdevRoot();

    let templateName = this.program.template;

    await this.preDelete();

    // find remote template
    if (this.program.remote) {
      if (!this.isValidFullTemplateName(templateName)) {
        console.log(
          colors.yellow(
            'Please specify the full template name i.e. <owner>/<template>'
          )
        );
        process.exit(1);
      }

      await this.checkLogin();
      await this.updateLogin();
      try {
        const response = await request
          .delete(this.templatesAPI + '/' + templateName.replace('/', '%2F'))
          .set('Authorization', `Bearer ${this.token}`)
          .send();
        console.log('[Remote]', templateName, 'removed');
      } catch (err) {
        if (err.status === 400) {
          const jsonError = JSON.parse(err.response.res.text);
          console.log(colors.yellow('[Remote]', jsonError.error.message));
        } else {
          console.log(colors.yellow('[Remote]', err.message));
        }
      }
    }

    // find local template
    let templateFolder = path.join(this.templateFolder, templateName);
    if (!fs.existsSync(templateFolder)) {
      console.log(colors.yellow('[Local]', 'Template not found.'));
      process.exit(1);
    } else {
      // delete local template
      await fs.remove(templateFolder);
      console.log('[Local]', templateName, 'removed');
    }

    return true;
  }

  async deploy() {
    let parentProjectFolder = path.join(this.currentLocation, '../');

    if (!this.program.force) {
      if (
        fs.existsSync(path.join(parentProjectFolder, '.no-snapdev-project'))
      ) {
        console.log(
          colors.yellow('Project folder conatins .no-snapdev-project file')
        );
        process.exit(1);
      }
    }

    const generated = await this.generate();
    if (!generated) {
      process.exit(1);
    }

    let srcFolder = this.distFolder;
    let distFolder = parentProjectFolder;

    // copy the files but don't override
    await fs.copy(srcFolder, distFolder, {
      overwrite: this.program.force
    });

    console.log('');
    console.log('Deployed!');

    return true;
  }

  async list() {
    console.log('Getting lists...');

    console.log('');
    console.log('=== Remote ===');
    console.log('');

    // check login
    const isLoggedIn = await this.checkLogin(false);

    let list = [];
    if (isLoggedIn) {
      // get the template list
      const cred = await this.getCredentials();
      try {
        const response = await request
          .get(this.templatesAPI + '/me')
          .set('Authorization', `Bearer ${cred.token}`)
          .send();

        list = response.body.data;
      } catch (err) {
        if (err.status === 400) {
          const jsonError = JSON.parse(err.response.res.text);
          console.log(colors.yellow(jsonError.error.message));
        } else {
          console.log(colors.yellow(err.message));
        }
        process.exit(1);
      }
    }

    // show the list
    if (list.length === 0) {
      if (isLoggedIn) {
        console.log(colors.yellow('No templates found'));
      } else {
        console.log(
          colors.yellow('You must be logged in to see your remote templates')
        );
      }
    } else {
      let values = list.map(t => {
        if (t.isPrivate) {
          return chalk.yellow(t.name);
        } else {
          return t.name;
        }
      });

      console.log(columns(values));
    }

    console.log('');
    console.log('=== Local ===');
    console.log('');

    let localList = [];

    // get list of local templates
    localList = TemplateManager.getLocalTemplates(this.templateFolder);
    // console.log(localList);

    // show list
    if (localList.length === 0) {
      console.log(colors.yellow('No templates found'));
    } else {
      console.log(columns(localList));
    }

    return true;
  }

  downloadZip(token, templateName, saveToFile) {
    return new Promise((resolve, reject) => {
      const stream = fs.createWriteStream(saveToFile);
      request
        .post(this.templatesAPI + '/pull')
        .set('Authorization', `Bearer ${token}`)
        .send({
          name: templateName
        })
        .on('error', function(error) {
          reject(error);
        })
        .pipe(stream)
        .on('finish', function() {
          resolve();
        });
    });
  }

  async clone() {
    let templateName = this.program.template;

    // check snapdev root
    this.checkSnapdevRoot();

    // check login
    await this.checkLogin();
    await this.updateLogin();

    // check full template name
    if (!this.isValidFullTemplateName(templateName)) {
      // default to current user
      templateName = this.username.concat('/', templateName);
    }

    let newTemplateLocation = path.join(this.templateFolder, templateName);

    // check if location is empty
    if (fs.existsSync(newTemplateLocation) && !this.program.force) {
      console.log(
        colors.yellow(
          'The destination location is not empty, add --force to override.'
        )
      );
      process.exit(1);
    }

    // download zip file
    const tempFile = await this.makeTempFile();
    let distZipFile = tempFile + '.zip';

    console.log('Cloning template....');
    const cred = await this.getCredentials();

    // validate if the user has access to the template
    try {
      await request
        .get(this.templatesAPI + '/' + templateName.replace('/', '%2F'))
        .set('Authorization', `Bearer ${cred.token}`)
        .send();
    } catch (err) {
      if (err.status === 400) {
        const jsonError = JSON.parse(err.response.res.text);
        console.log(colors.yellow(jsonError.error.message));
      } else {
        console.log(colors.yellow(err.message));
      }
      process.exit(1);
    }

    try {
      // download zip file
      await this.downloadZip(cred.token, templateName, distZipFile);

      // console.log('Zip File:', distZipFile);
      // console.log('Zip size:', this.getFilesizeInBytes(distZipFile));

      console.log('Download size:', this.getFilesizeInBytes(distZipFile));
      // extract zip file
      console.log('Clone location:', newTemplateLocation);
      // console.log('Zip file:', distZipFile);
      try {
        this.extractZip(distZipFile, newTemplateLocation);
      } catch (error) {
        console.log(colors.yellow('Unable to extract template:', error));
        process.exit(1);
      }
      // console.log('Clone Succeeded');

      // switch branch context
      await this.switchContextBranch(templateName);
    } catch (err) {
      if (err.status === 400) {
        const jsonError = JSON.parse(err.response.res.text);
        console.log(colors.yellow(jsonError.error.message));
      } else {
        console.log(colors.yellow(err.message));
      }
      process.exit(1);
    }

    return true;
  }

  extractZip(zipFile, distFolder) {
    const zip = new AdmZip(zipFile);
    zip.extractAllTo(distFolder, true);
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

  getFilesizeInBytes(filename) {
    const stats = fs.statSync(filename);
    const fileSizeInBytes = stats.size;
    return fileSizeInBytes;
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

    try {
      await this.zipDirectory(templateFolder, distZipFile);
      // console.log('Zip File:', distZipFile);
      // console.log('Zip size:', this.getFilesizeInBytes(distZipFile));
      // console.log('Zip file created');
    } catch (e) {
      console.log(colors.yellow('Unable to create zip file'), colors.yellow(e));
      process.exit(1);
    }

    // upload template
    console.log('Pushing...');
    console.log('Upload size:', this.getFilesizeInBytes(distZipFile));
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
      console.log('Logged in as:', cred.username);
    } catch (err) {
      console.log(colors.yellow(err.message));
    }

    return true;
  }

  async logout() {
    // call logout API
    console.log('Logging out...');

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
      if (this.program.force) {
        await this.updateJSON(this.credentialFile, {
          username: '',
          token: ''
        });
        console.log('Removed login credentials');
      } else {
        console.log(colors.yellow(err.message));
      }
    }

    return true;
  }

  async register() {
    console.log('');

    if (!validator.isEmail(this.program.email)) {
      console.log(colors.yellow('Invalid email address'));
      process.exit(1);
    }

    if (this.program.password !== this.program.password2) {
      console.log(colors.yellow('Passwords mismatch'));
      process.exit(1);
    }

    // call sign up API
    try {
      const response = await request.post(this.usersAPI + '/signup').send({
        displayName: this.program.username,
        email: this.program.email,
        username: this.program.username,
        password: this.program.password
      });

      console.log('Account created.');
    } catch (err) {
      if (err.status === 400) {
        console.log(colors.yellow('Failed to created account.'));
      } else {
        console.log(colors.yellow(err.message));
      }
    }
    return true;
  }

  async inputLogin() {
    console.log(
      'Login with your snapdev username to push and clone templates from snapdev online repository.'
    );

    let list = [];

    // console.log('usr', this.program.username);
    if (this.program.username === undefined) {
      list.push({
        name: 'username',
        message: 'Username:',
        validate: function validateFirstName(value) {
          return value !== '';
        }
      });
    }

    // console.log('pass', this.program.password);
    if (this.program.password === undefined) {
      list.push({
        name: 'password',
        message: 'Password:',
        type: 'password',
        validate: function validateFirstName(value) {
          return value !== '';
        }
      });
    }

    const input = await inquirer.prompt(list);

    if (this.program.username === undefined) {
      this.program.username = input.username;
    }
    if (this.program.password === undefined) {
      this.program.password = input.password;
    }
  }

  async login() {
    console.log('Logging in...');
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
    let projectFolder = this.currentLocation;

    // create project folder if specified
    if (this.program.project) {
      projectFolder = path.join(projectFolder, this.program.project);
    }

    // create snapdev folder if not found
    let snapdevFolder = path.join(projectFolder, 'snapdev');
    if (!fs.existsSync(snapdevFolder)) {
      fs.mkdirSync(snapdevFolder, { recursive: true });
    }

    // create templates folder if not found
    let templateFolder = path.join(snapdevFolder, 'templates');
    if (!fs.existsSync(templateFolder)) {
      fs.mkdirSync(templateFolder, { recursive: true });
    }

    // create snapdev file from a starter template
    let newSnapdevFile = path.join(snapdevFolder, 'snapdev.json');

    this.copyStarter(
      this.starterSnapdevFile,
      newSnapdevFile,
      this.mustacheModel
    );

    return true;
  }

  async status() {
    const cred = await this.getCredentials();
    let username = '';
    if (cred) {
      username = cred.username;
    }
    console.log('Logged in as:', username);

    this.checkSnapdevRoot();

    let {
      branch,
      templateFolder,
      templateVersion
    } = await this.getTemplateContext(false);

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
      branch,
      templateName
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
      templateName = newName;

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
      await this.checkLogin();

      const valid = this.validUsername(username);
      if (valid) {
        if (branch.indexOf('/') > -1) {
          let currentBranch = branch;
          let newBranch = username.concat('/', templateName);

          if (currentBranch === newBranch) {
            /* already tagged */
            console.log('Tagged', branch);
          } else {
            /** Create a copy of the template under the current user */

            // console.log('Current branch:', currentBranch);
            // console.log('New branch:', newBranch);

            // create new branch
            const currentTemplateFolder = path.join(
              this.templateFolder,
              currentBranch
            );
            const newTemplateFolder = path.join(this.templateFolder, newBranch);

            // console.log('Current branch path:', currentTemplateFolder);
            // console.log('New branch path:', newTemplateFolder);

            if (!fs.existsSync(newTemplateFolder)) {
              fs.mkdirSync(newTemplateFolder, { recursive: true });
            }
            await fs.copy(currentTemplateFolder, newTemplateFolder, {
              overwrite: false
            });
            console.log('Tagged', newBranch);
            // switch context
            await this.switchContextBranch(newBranch);
          }
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

    /**============================ */
    // tag template as private
    /**============================ */
    if (this.program.private && this.program.public) {
      console.log(
        colors.yellow('Cannot use --private and --public at the same time')
      );
      process.exit(1);
    }
    if (this.program.private || this.program.public) {
      await this.checkLogin();
      const cred = await this.getCredentials();
      let isPrivate = this.program.private !== undefined;
      // console.log('isPrivate', isPrivate);
      // console.log('branch', branch);

      try {
        const response = await request
          .patch(this.templatesAPI + '/' + branch.replace('/', '%2F'))
          .set('Authorization', `Bearer ${cred.token}`)
          .send({
            isPrivate
          });

        if (isPrivate) {
          console.log('Marked template as private');
        } else {
          console.log('Marked template as public');
        }
      } catch (err) {
        if (err.status === 400) {
          const jsonError = JSON.parse(err.response.res.text);
          console.log(colors.yellow(jsonError.error.message));
        } else {
          console.log(colors.yellow(err.message));
        }
        process.exit(1);
      }
    }

    return true;
  }

  async checkout() {
    this.checkSnapdevRoot();

    // validate template name against short and full name
    let templateName;
    let programTemplate = this.program.template;

    if (programTemplate.indexOf('/') > -1) {
      // username/template-name
      if (!validator.matches(programTemplate, this.fullTemplateNameRule)) {
        console.log(colors.yellow('Invalid template name.'));
        return false;
      }
      templateName = programTemplate;
    } else {
      // template-name
      if (!validator.matches(programTemplate, this.shortTemplateNameRule)) {
        console.log(colors.yellow('Invalid template name.'));
        return false;
      }

      if (this.program.create) {
        // prefix the template with the username
        const loggedIn = await this.isLoggedIn();
        if (loggedIn) {
          const cred = await this.getCredentials();
          templateName = cred.username + '/' + programTemplate;
        } else {
          templateName = programTemplate;
        }
      } else {
        templateName = programTemplate;
      }
    }

    // get new folder name
    // console.log(this.templateFolder, templateName);
    let newTemplateFolder = path.join(this.templateFolder, templateName);
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
    await this.switchContextBranch(templateName);

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

  getShortTemplateName(templateName) {
    let shortName;
    if (templateName.indexOf('/') > -1) {
      // has username
      shortName = templateName.split('/')[1];
    } else {
      // no username
      shortName = templateName;
    }
    return shortName;
  }

  async getTemplateContext(exit = true) {
    const snapdevData = await this.readJSON('snapdev.json');
    const branch = snapdevData.branch;
    let templateName = this.getShortTemplateName(branch);

    const cred = await this.getCredentials();
    let username = '';
    if (cred) {
      username = cred.username;
    }

    let templateFolder = path.join(this.templateFolder, branch);
    if (!fs.existsSync(path.join(templateFolder, 'template.json'))) {
      console.log(colors.yellow('template.json not found'));
      if (exit) {
        process.exit(1);
      } else {
        return {
          username,
          templateFolder: '',
          templateSrcFolder: '',
          templateVersion: '',
          templateJSONFile: '',
          branch: ''
        };
      }
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
      branch,
      templateName
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

    // console.log('Template root:', templateFolder);
    // console.log('Template src:', templateSrcFolder);
    console.log('Template name:', branch);

    let modelName;
    if (this.program.model !== undefined && this.program.model !== '') {
      modelName = this.program.model;
    } else {
      modelName = 'default.json';
    }

    if (
      this.program.all &&
      (this.program.model === undefined || this.program.model === '')
    ) {
      console.log('Generate for all models.');

      // run for all models in the folder
      let modelFolder = path.join(templateFolder, 'models');
      const modelManager = new ModelManager();
      let models = modelManager.getAllFiles(modelFolder);
      // console.log(models);
      models.forEach(model => {
        this.generateForModel(model, templateFolder, templateSrcFolder);
        console.log();
      });
    } else {
      this.generateForModel(modelName, templateFolder, templateSrcFolder);
    }

    return true;
  }

  generateForModel(modelName, templateFolder, templateSrcFolder) {
    // find the model file
    let modelFile = path.join(templateFolder, 'models', modelName);
    console.log('Model filename:', modelName);
    if (!fs.existsSync(modelFile)) {
      const ext = path.extname(modelFile);
      if (ext !== '.json') {
        modelFile += '.json';
      }
      // console.log(modelFile);
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

  async updateLogin() {
    this.cred = await this.getCredentials();
    if (this.cred) {
      this.username = this.cred.username;
      this.token = this.cred.token;
    } else {
      this.username = '';
      this.token = '';
    }
  }

  async checkLogin(exit = true) {
    const loggedIn = await this.isLoggedIn();
    if (!loggedIn) {
      if (exit) {
        console.log(colors.yellow('Please run [snapdev login] to log in.'));
        process.exit(1);
      } else {
        return false;
      }
    }

    return true;
  }

  isValidFullTemplateName(templateName) {
    return validator.matches(templateName, this.fullTemplateNameRule);
  }

  isValidShortTemplateName(templateName) {
    return validator.matches(templateName, this.shortTemplateNameRule);
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
