const path = require('path');
const fs = require('fs-extra');
const colors = require('colors');
const mustache = require('mustache');
const validator = require('validator');
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
const inquirer = require('inquirer');
const klawSync = require('klaw-sync');
const HttpStatus = require('http-status-codes');
const dir = require('../lib/node-dir');
const TemplateManager = require('./templateManager');
const Generator = require('./generator');

const Deploy = require('./command/deploy');
const Compose = require('./command/compose');
const Generate = require('./command/generate');
const Clean = require('./command/clean');
const Push = require('./command/push');
const Clone = require('./command/clone');
const Pull = require('./command/pull');

class CLI {
  constructor(program, version) {
    this.program = program;
    this.version = version;
    this.currentLocation = process.cwd();
    this.snapdevFolder = this.currentLocation;
    this.templateFolder = path.join(this.snapdevFolder, 'templates');
    this.starterFolder = path.normalize(path.join(__dirname, '..', 'starters'));
    this.distFolder = path.join(this.snapdevFolder, 'dist');
    this.modelsFolder = path.join(this.snapdevFolder, 'models');
    this.headFolder = path.join(this.snapdevFolder, '.head');
    this.snapdevHome = path.join(homePath(), config.homeFolder);
    this.credentialFile = path.join(this.snapdevHome, 'credentials');

    // console.log(colors.yellow('Home folder: ' + this.snapdevHome));

    // rules
    this.shortTemplateNameRule = '^[a-z][a-z0-9-_]*$';
    this.fullTemplateNameRule = '^[a-z][a-z0-9-_]*[/][a-z0-9-_]*$';

    // starters
    this.starterModelFile = path.join(this.starterFolder, 'model.json');
    this.starterSchemaFile = path.join(this.starterFolder, 'schema.json');
    this.starterSnapdevFile = path.join(this.starterFolder, 'snapdev.json');
    this.starterAppComposeFile = path.join(this.starterFolder, 'app-compose.yml');
    this.starterTemplateJsonFile = path.join(this.starterFolder, 'template.json');
    this.starterReadMeFile = path.join(this.starterFolder, 'README.md');
    this.starterSampleTemplateFile = path.join(this.starterFolder, '{{titlecase}}.java.txt');

    this.mustacheModel = {
      version: this.version,
    };
    // API
    this.snapdevHost = config.snapdevHost;
    this.usersAPI = config.snapdevHost + config.apiv1 + config.usersAPI;
    this.templatesAPI = config.snapdevHost + config.apiv1 + config.templatesAPI;
    this.apiv1 = this.snapdevHost + config.apiv1;
    // Auth
    this.username = '';
    this.token = '';
    this.cred = null;
  }

  async model() {
    this.checkSnapdevRoot();
    const { templateModelFolder } = await this.getTemplateContext();

    if (this.program.pwd) {
      console.log(templateModelFolder);
      return true;
    }

    let modelList = [];
    const files = dir.files(templateModelFolder, {
      sync: true,
    });
    if (!files) {
      modelList = [];
    } else {
      modelList = files.map((f) => f.replace(path.join(templateModelFolder, '/'), ''));
    }

    if (modelList.length === 0) {
      console.log(colors.yellow('No models found'));
    } else {
      console.log(columns(modelList));
    }

    return true;
  }

  async update() {
    this.checkSnapdevRoot();
    const { templateSrcFolder } = await this.getTemplateContext();

    let hasAction = false;
    /** ============================ */
    // ext
    /** ============================ */
    if (this.program.ext) {
      hasAction = true;

      const filterFn = (item) => {
        const basename = path.basename(item.path);
        const ret = basename === '.' || basename[0] !== '.';
        // console.log(ret, item.path);
        return ret;
      };

      try {
        console.log('Root:', templateSrcFolder);
        const paths = klawSync(templateSrcFolder, {
          nodir: true,
          filter: filterFn,
        });
        const files = paths.map((p) => p.path);
        console.log('File count:', files.length);

        for (let index = 0; index < files.length; index++) {
          const file = files[index];
          // console.log('File:', file);
          if (path.extname(file) !== '.sd') {
            const newFile = `${file}.sd`;
            await fs.move(file, newFile);
            console.log('Updated:', newFile);
          }
        }
        console.log();
        console.log('Done.');
        // console.dir(files);
      } catch (err) {
        console.log(colors.yellow('Unable to update extensions:'), err.message);
        process.exit(1);
      }
    }

    return hasAction;
  }

  async preReset() {
    const { branch } = await this.getTemplateContext();

    this.program.template = branch;

    if (this.program.force !== undefined && this.program.force) {
      // user add --force
    } else {
      this.program.force = true;
      const input = await inquirer.prompt([
        {
          type: 'confirm',
          name: 'canReset',
          message: `Are you sure you want to reset '${branch}' to the latest online version`,
        },
      ]);

      if (!input.canReset) {
        process.exit(1);
      }
    }
  }

  async reset() {
    // check snapdev root
    this.checkSnapdevRoot();

    await this.preReset();

    await this.clone(false);

    return true;
  }

  async preDelete() {
    const templateName = this.program.template;

    const input = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'canDelete',
        message: `Are you sure you want to delete ${templateName}`,
      },
    ]);

    if (!input.canDelete) {
      process.exit(1);
    }
  }

  async delete() {
    const templateName = this.program.template;

    if (!this.program.force) {
      await this.preDelete();
    }

    // find remote template
    if (this.program.remote) {
      if (!this.isValidFullTemplateName(templateName)) {
        console.log(colors.yellow('Please specify the full template name i.e. <owner>/<template>'));
        process.exit(1);
      }

      await this.checkLogin();
      try {
        await request
          .delete(`${this.templatesAPI}/${templateName.replace('/', '%2F')}`)
          .set('Authorization', `Bearer ${this.token}`)
          .send();
        console.log('[Remote]', templateName, 'removed');
      } catch (err) {
        if (err.status === HttpStatus.BAD_REQUEST) {
          console.log(colors.yellow('[Remote]', err.response.body.error.message));
        } else if (err.status === HttpStatus.UNAUTHORIZED) {
          console.log(colors.yellow('Session expired'));
          this.program.force = true;
          await this.logout();
        } else {
          console.log(colors.yellow('[Remote]', err.message));
        }
        process.exit(1);
      }
    }

    this.checkSnapdevRoot();

    // find local template
    const templateFolder = path.join(this.templateFolder, templateName);
    if (!fs.existsSync(templateFolder)) {
      console.log(colors.yellow('[Local]', 'Template not found'));
      process.exit(1);
    } else {
      // delete local template
      await fs.remove(templateFolder);
      console.log('[Local]', templateName, 'removed');
    }

    return true;
  }

  async preDeregister() {
    const cred = await this.getCredentials();
    const input = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'canDelete',
        message: `Are you sure you want to delete ${cred.username} account?`,
      },
    ]);

    if (!input.canDelete) {
      process.exit(1);
    }
  }

  async deregister() {
    this.checkSnapdevRoot();

    await this.checkLogin();

    if (!this.program.force) {
      await this.preDeregister();
    }

    try {
      await request.delete(`${this.usersAPI}/me`).set('Authorization', `Bearer ${this.token}`).send();
      console.log('Account deleted');
    } catch (err) {
      if (err.status === HttpStatus.BAD_REQUEST) {
        console.log(colors.yellow(err.response.body.error.message));
      } else if (err.status === HttpStatus.UNAUTHORIZED) {
        console.log(colors.yellow('Session expired'));
        this.program.force = true;
        await this.logout();
      } else {
        console.log(colors.yellow(err.message));
      }
      process.exit(1);
    }

    return true;
  }

  async deploy() {
    const exec = new Deploy(this);
    return exec.execute();
  }

  async compose() {
    const exec = new Compose(this);
    return exec.execute();
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
          .get(`${this.templatesAPI}/me`)
          .set('Authorization', `Bearer ${cred.token}`)
          .send();

        list = response.body.data;
      } catch (err) {
        if (err.status === HttpStatus.BAD_REQUEST) {
          console.log(colors.yellow(err.response.body.error.message));
        } else if (err.status === HttpStatus.UNAUTHORIZED) {
          console.log(colors.yellow('Session expired'));
          this.program.force = true;
          await this.logout();
        } else {
          console.log(colors.yellow(err.message));
        }
        process.exit(1);
      }
    }

    // show the list
    if (list.length === 0) {
      if (isLoggedIn) {
        console.log(colors.yellow('No remote templates found'));
      } else {
        console.log(colors.yellow('You must be logged in to see your remote templates'));
      }
    } else {
      const values = list.map((t) => {
        if (t.isPrivate) {
          return chalk.yellow(t.name);
        }
        return t.name;
      });

      console.log(columns(values));
    }

    console.log('');
    console.log('=== Local ===');
    console.log('');

    let localList = [];
    this.checkSnapdevRoot();

    // get list of local templates
    localList = TemplateManager.getLocalTemplates(this.templateFolder);
    // console.log(localList);

    // show list
    if (localList.length === 0) {
      console.log(colors.yellow('No local templates found'));
    } else {
      console.log(columns(localList));
    }

    return true;
  }

  downloadZip(token, templateName, version, saveToFile) {
    return new Promise((resolve, reject) => {
      const stream = fs.createWriteStream(saveToFile);
      request
        .post(`${this.templatesAPI}/pull`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          name: templateName,
          version,
        })
        .on('error', function (error) {
          reject(error);
        })
        .pipe(stream)
        .on('finish', function () {
          resolve();
        });
    });
  }

  async pull() {
    const exec = new Pull(this);
    return exec.execute();
  }

  async clone(isPull) {
    const exec = new Clone(this, isPull);
    return exec.execute();
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
        .on('error', (err) => reject(err))
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
    const exec = new Push(this);
    return exec.execute();
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

      await request.get(`${this.usersAPI}/me`).set('Authorization', `Bearer ${cred.token}`).send();
      console.log('Logged in as:', cred.username);
      console.log('Login Succeeded');
    } catch (err) {
      if (err.status === HttpStatus.BAD_REQUEST) {
        console.log(colors.yellow(err.response.body.error.message));
        process.exit(1);
      } else if (err.status === HttpStatus.UNAUTHORIZED) {
        console.log(colors.yellow('Session expired'));
        this.program.force = true;
        await this.logout();
        await this.login();
      } else {
        console.log(colors.yellow(err.message));
        process.exit(1);
      }
    }

    return true;
  }

  async logout() {
    // call logout API
    console.log('Logging out...');

    try {
      const cred = await this.getCredentials();

      if (!this.program.local) {
        await request.post(`${this.usersAPI}/logout`).set('Authorization', `Bearer ${cred.token}`).send();
      }

      await this.updateJSON(this.credentialFile, {
        username: '',
        token: '',
      });
      console.log('Logged out!');
    } catch (err) {
      if (this.program.force) {
        await this.updateJSON(this.credentialFile, {
          username: '',
          token: '',
        });
        console.log('Logged out!');
      } else {
        console.log(colors.yellow(err.message));
        process.exit(1);
      }
    }

    return true;
  }

  async register() {
    console.log('');

    let hasErrors = false;

    if (this.program.username === undefined || validator.isEmpty(this.program.username)) {
      console.log(colors.yellow('--username is required'));
      hasErrors = true;
    }

    if (!this.program.force) {
      if (this.program.password !== this.program.password2) {
        console.log(colors.yellow('Passwords mismatch'));
        hasErrors = true;
      }
    } else if (this.program.password === undefined || validator.isEmpty(this.program.password)) {
      console.log(colors.yellow('--password is required'));
      hasErrors = true;
    }

    if (this.program.email === undefined || !validator.isEmail(this.program.email)) {
      console.log(colors.yellow('--email is required'));
      hasErrors = true;
    }

    if (hasErrors) {
      process.exit(1);
    }

    // call sign up API
    try {
      await request.post(`${this.usersAPI}/signup`).send({
        displayName: this.program.username,
        email: this.program.email,
        username: this.program.username,
        password: this.program.password,
      });
      console.log('Account created');
    } catch (err) {
      if (err.status === HttpStatus.BAD_REQUEST) {
        console.log(colors.yellow(err.response.body.error.message));
      } else if (err.status === HttpStatus.UNAUTHORIZED) {
        console.log(colors.yellow('Session expired'));
        this.program.force = true;
        await this.logout();
      } else {
        console.log(colors.yellow(err.message));
      }
      process.exit(1);
    }
    return true;
  }

  async inputLogin() {
    console.log('Login with your snapdev username to push and clone templates from snapdev online repository');

    const list = [];

    // console.log('usr', this.program.username);
    if (this.program.username === undefined) {
      list.push({
        name: 'username',
        message: 'Username:',
        validate: function validateFirstName(value) {
          return value !== '';
        },
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
        },
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
    // use existing token if available
    const isLoggedIn = await this.isLoggedIn();
    if (isLoggedIn) {
      return this.relogin();
    }

    if (this.program.username && this.program.password) {
      // direct login
    } else {
      await this.inputLogin();
    }

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
      const response = await request.post(`${this.usersAPI}/login`).send({
        username: this.program.username,
        password: this.program.password,
      });
      await this.updateJSON(this.credentialFile, {
        username: this.program.username,
        token: response.body.data.token,
      });
      console.log(`Logged in as: ${this.program.username}`);

      console.log('Login Succeeded');
    } catch (err) {
      if (err.status === HttpStatus.BAD_REQUEST) {
        console.log(colors.yellow(err.response.body.error.message));
      } else if (err.status === HttpStatus.UNAUTHORIZED) {
        console.log(colors.yellow('Session expired'));
        this.program.force = true;
        await this.logout();
      } else {
        console.log(colors.yellow(err.message));
      }
      process.exit(1);
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
    const snapdevFolder = path.join(projectFolder, 'snapdev');
    if (!fs.existsSync(snapdevFolder)) {
      fs.mkdirSync(snapdevFolder, { recursive: true });
    }

    // create head folder
    const headFolder = path.join(snapdevFolder, '.head');
    if (!fs.existsSync(headFolder)) {
      fs.mkdirSync(headFolder, { recursive: true });
    }

    // create models folder if not found
    const modelsFolder = path.join(snapdevFolder, 'models');
    if (!fs.existsSync(modelsFolder)) {
      fs.mkdirSync(modelsFolder, { recursive: true });
    }
    const newModelFile = path.join(modelsFolder, 'default.json');

    // create templates folder if not found
    const templateFolder = path.join(snapdevFolder, 'templates');
    if (!fs.existsSync(templateFolder)) {
      fs.mkdirSync(templateFolder, { recursive: true });
    }

    // create snapdev file from a starter template
    const newSnapdevFile = path.join(snapdevFolder, 'snapdev.json');
    this.copyStarter(this.starterSnapdevFile, newSnapdevFile, this.mustacheModel);

    const newAppComposeFile = path.join(snapdevFolder, 'app-compose.yml');
    this.copyStarter(this.starterAppComposeFile, newAppComposeFile);

    this.copyStarter(this.starterModelFile, newModelFile);

    return true;
  }

  async status() {
    const cred = await this.getCredentials();
    let username = '';
    if (cred) {
      username = cred.username;
    }

    // get API version
    let apiVersion;
    try {
      const response = await request.get(`${this.apiv1}/version`).send();
      apiVersion = response.body.version;
    } catch (e) {
      apiVersion = 'Network error';
    }

    console.log('API endpoint:', config.snapdevHost);
    console.log('API version:', apiVersion);
    console.log('Logged in as:', username);

    this.checkSnapdevRoot();

    const {
      branch,
      templateFolder,
      templateVersion,
      templatePrivate,
      templateTags,
      pushId,
    } = await this.getTemplateContext(false);

    if (branch === '') {
      console.log(colors.yellow('template.json not found'));
    }
    console.log('Template name:', branch);
    console.log('Template version:', templateVersion);
    console.log('Template tags:', templateTags.join(','));
    console.log('Template acl:', templatePrivate ? 'private' : 'public');
    console.log('Template root:', templateFolder);
    console.log('Last commit:', pushId);
    return true;
  }

  async tag() {
    this.checkSnapdevRoot();
    let { templateFolder, username, templateJSONFile, branch, templateName } = await this.getTemplateContext();

    /** ============================ */
    // set version
    /** ============================ */
    if (this.program.version !== undefined) {
      const { version } = this.program;
      if (semver.valid(version) === null) {
        console.log(colors.yellow('Invalid version number format. Please use the https://semver.org/ specification'));
        process.exit(1);
      }
      // update template.json
      // console.log(semver.clean(version),'$$$',version);
      const updated = await this.updateJSON(templateJSONFile, {
        version: semver.clean(version),
      });
      if (updated) {
        console.log(branch, 'set to version', version);
      }
    }

    /** ============================ */
    // set tags
    /** ============================ */
    if (this.program.tags !== undefined) {
      const { tags } = this.program;
      if (validator.isEmpty(tags)) {
        console.log(colors.yellow('Invalid tag list'));
        process.exit(1);
      }
      const updated = await this.updateJSON(templateJSONFile, {
        tags: tags.split(','),
      });
      if (updated) {
        console.log('Tags updated');
      }
    }

    /** ============================ */
    // set description
    /** ============================ */
    if (this.program.description !== undefined) {
      const newDescription = this.program.description;
      if (validator.isEmpty(newDescription)) {
        console.log(colors.yellow('Invalid template description'));
        process.exit(1);
      }
      const updated = await this.updateJSON(templateJSONFile, {
        description: newDescription,
      });
      if (updated) {
        console.log('Description updated');
      }
    }

    /** ============================ */
    // set name
    /** ============================ */
    if (this.program.name !== undefined) {
      const newName = this.program.name;
      // make sure it's a short name
      if (!validator.matches(newName, this.shortTemplateNameRule)) {
        console.log(colors.yellow('Invalid template name'));
        process.exit(1);
      }

      let newBranch;
      if (branch.indexOf('/') > -1) {
        // has username
        const user = branch.split('/')[0];
        newBranch = `${user}/${newName}`;
      } else {
        // no username
        newBranch = newName;
      }
      templateName = newName;

      const newTemplateLocation = path.join(this.templateFolder, newBranch);
      const oldTemplateLocation = templateFolder;

      // console.log('OLD BRANCH:', branch);
      // console.log('OLD LOCATION:', oldTemplateLocation);
      // console.log('NEW BRANCH:', newBranch);
      // console.log('NEW LOCATION:', newTemplateLocation);

      if (fs.existsSync(newTemplateLocation)) {
        console.log(colors.yellow('Template name already exists at that location', newTemplateLocation));
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

        await this.updateJSON(templateJSONFile, {
          name: newName,
        });

        // update context branch
        await this.switchContextBranch(newBranch);

        branch = newBranch;
      } catch (err) {
        console.log(colors.yellow('Unable to rename template', err));
        process.exit(1);
      }
    }

    /** ============================ */
    // tag with a user
    /** ============================ */
    if (this.program.user) {
      await this.checkLogin();

      const valid = this.validUsername(username);
      if (valid) {
        if (branch.indexOf('/') > -1) {
          const currentBranch = branch;
          const newBranch = username.concat('/', templateName);

          if (currentBranch === newBranch) {
            /* already tagged */
            console.log('Tagged', branch);
          } else {
            /** Create a copy of the template under the current user */

            // console.log('Current branch:', currentBranch);
            // console.log('New branch:', newBranch);

            // create new branch
            const currentTemplateFolder = path.join(this.templateFolder, currentBranch);
            const newTemplateFolder = path.join(this.templateFolder, newBranch);

            // console.log('Current branch path:', currentTemplateFolder);
            // console.log('New branch path:', newTemplateFolder);

            if (!fs.existsSync(newTemplateFolder)) {
              fs.mkdirSync(newTemplateFolder, { recursive: true });
            }
            await fs.copy(currentTemplateFolder, newTemplateFolder, {
              overwrite: false,
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
            console.log(colors.yellow('Tag destination already exists', newTemplateFolder));
            process.exit(1);
          }

          try {
            // move template into the user folder
            await fs.move(templateFolder, newTemplateFolder);
            console.log('From:', templateFolder);
            console.log('To:', newTemplateFolder);

            // update context branch
            await this.switchContextBranch(`${username}/${branch}`);
          } catch (err) {
            console.log(colors.yellow('Unable to move template', err));
            process.exit(1);
          }
        }
      }
    }

    /** ============================ */
    // tag template as public or private
    /** ============================ */
    // setting must take effect when pushing to online.
    if (this.program.private && this.program.public) {
      console.log(colors.yellow('Cannot use --private and --public at the same time'));
      process.exit(1);
    }
    if (this.program.private || this.program.public) {
      const isPrivate = this.program.private !== undefined;

      const updated = await this.updateJSON(templateJSONFile, {
        private: isPrivate,
      });

      if (updated) {
        if (isPrivate) {
          console.log('Template marked as private');
        } else {
          console.log('Template marked as public');
        }
      }
    }

    return true;
  }

  async create() {
    this.checkSnapdevRoot();

    // validate template name against short and full name
    let templateName;
    const programTemplate = this.program.template;

    if (programTemplate.indexOf('/') > -1) {
      // username/template-name
      if (!validator.matches(programTemplate, this.fullTemplateNameRule)) {
        console.log(colors.yellow('Invalid template name'));
        return false;
      }
      templateName = programTemplate;
    } else {
      // template-name
      if (!validator.matches(programTemplate, this.shortTemplateNameRule)) {
        console.log(colors.yellow('Invalid template name'));
        return false;
      }

      // prefix the template with the username
      const loggedIn = await this.isLoggedIn();
      if (loggedIn) {
        const cred = await this.getCredentials();
        templateName = `${cred.username}/${programTemplate}`;
      } else {
        templateName = programTemplate;
      }
    }

    // get new folder name
    const newTemplateFolder = path.join(this.templateFolder, templateName);
    const srcFolder = path.join(newTemplateFolder, 'src');
    // make sure template folder does not exists
    if (fs.existsSync(srcFolder)) {
      console.log(colors.yellow('Template name already exists'));
      process.exit(1);
    }

    // create src folder
    fs.mkdirSync(srcFolder, { recursive: true });

    // save template.json in the folder
    this.copyStarter(this.starterTemplateJsonFile, path.join(newTemplateFolder, 'template.json'), {
      name: templateName,
      version: '0.0.1',
    });

    // save schema.json in the folder
    this.copyStarter(this.starterSchemaFile, path.join(newTemplateFolder, 'schema.json'), {
      name: templateName,
    });

    // copy readme file
    // TODO: Render all the token values from the generator
    this.copyStarter(this.starterReadMeFile, path.join(newTemplateFolder, 'README.md'), {
      name: templateName,
    });

    // copy template sample file
    this.copyStarter(this.starterSampleTemplateFile, path.join(srcFolder, '{{titlecase}}.java.txt'), null);

    // create models folder
    const modelFolder = path.join(newTemplateFolder, 'models');
    if (!fs.existsSync(modelFolder)) {
      fs.mkdirSync(modelFolder, { recursive: true });
    }

    // create sample models file
    this.copyStarter(this.starterModelFile, path.join(modelFolder, 'default.json'));

    // switch context
    await this.switchContextBranch(templateName);

    return true;
  }

  hasTemplate(templateName) {
    const newTemplateFolder = path.join(this.templateFolder, templateName);
    const srcFolder = path.join(newTemplateFolder, 'src');
    return fs.existsSync(srcFolder);
  }

  async checkout() {
    this.checkSnapdevRoot();

    // validate template name against short and full name
    let templateName;
    const programTemplate = this.program.template;

    if (programTemplate.indexOf('/') > -1) {
      // username/template-name
      if (!validator.matches(programTemplate, this.fullTemplateNameRule)) {
        console.log(colors.yellow('Invalid template name'));
        return false;
      }
      templateName = programTemplate;
    } else {
      // template-name
      if (!validator.matches(programTemplate, this.shortTemplateNameRule)) {
        console.log(colors.yellow('Invalid template name'));
        return false;
      }

      // if shorn name not found then append user if logged in and search for full template
      if (!this.hasTemplate(programTemplate)) {
        // console.log(colors.yellow('Template not found', programTemplate));

        // check full name template
        const loggedIn = await this.isLoggedIn();
        if (loggedIn) {
          const cred = await this.getCredentials();
          templateName = `${cred.username}/${programTemplate}`;
        } else {
          templateName = programTemplate;
        }
      } else {
        // use short name
        templateName = programTemplate;
      }
    }

    // get new folder name
    // console.log(this.templateFolder, templateName);
    if (!this.hasTemplate(templateName)) {
      console.log(colors.yellow('Template not found', templateName));
      process.exit(1);
    }

    // switch context
    await this.switchContextBranch(templateName);

    return true;
  }

  async switchContextBranch(branch) {
    const updated = await this.updateJSON('snapdev.json', {
      branch,
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
      console.log(colors.yellow('Unable to modify json file:', filename, error));
    }
    return false;
  }

  async setPushId(templateId, pushId) {
    // create head folder
    const headFolder = path.join(this.snapdevFolder, '.head');
    if (!fs.existsSync(headFolder)) {
      fs.mkdirSync(headFolder, { recursive: true });
    }
    if (!templateId || templateId === '') {
      console.log(colors.yellow('PushId not set'));
      process.exit(1);
    }
    const filename = path.join(headFolder, templateId);
    try {
      await json.update(filename, {
        pushId,
      });
      return true;
    } catch (error) {
      console.log(colors.yellow('Unable to update file:', filename, error));
    }
    return false;
  }

  async getPushId(templateId) {
    const headFolder = path.join(this.snapdevFolder, '.head');
    if (!fs.existsSync(headFolder)) {
      fs.mkdirSync(headFolder, { recursive: true });
    }
    if (!templateId || templateId === '') {
      return '';
    }
    const filename = path.join(headFolder, templateId);
    try {
      if (!fs.existsSync(filename)) {
        await json.update(filename, {});
      }
      const data = await json.load(filename);
      return data.pushId || '';
    } catch (error) {
      console.log(colors.yellow('Unable to read file:', filename, error));
    }
    return '';
  }

  async readJSON(filename) {
    if (!fs.existsSync(filename)) {
      await json.update(filename, {});
    }
    const data = await json.load(filename);
    return data;
  }

  async getCredentials() {
    if (fs.existsSync(this.credentialFile)) {
      const cred = await this.readJSON(this.credentialFile);
      return cred;
    }
    return null;
  }

  getShortTemplateName(templateName) {
    let shortName;
    if (templateName.indexOf('/') > -1) {
      // has username
      [, shortName] = templateName.split('/');
    } else {
      // no username
      shortName = templateName;
    }
    return shortName;
  }

  async getTemplateContext(exit = true, readSchemaDef = false) {
    const snapdevData = await this.readJSON('snapdev.json');
    const { branch } = snapdevData;
    const templateName = this.getShortTemplateName(branch);

    const cred = await this.getCredentials();
    let username = '';
    if (cred) {
      username = cred.username;
    }

    const templateFolder = path.join(this.templateFolder, branch);
    if (!fs.existsSync(path.join(templateFolder, 'template.json'))) {
      if (exit) {
        console.log(colors.yellow('template.json not found'));
        process.exit(1);
      } else {
        return {
          username,
          pushId: '',
          templateId: '',
          templateFolder: '',
          templateSrcFolder: '',
          templateVersion: '',
          templateJSONFile: '',
          branch: '',
          templateModelFolder: '',
          templateName: '',
          templatePrivate: true,
          templateTags: [],
          templateDescription: '',
          templateSchemaDef: {},
        };
      }
    }

    /// get template details
    const templateJSONFile = path.join(templateFolder, 'template.json');
    const templateData = await this.readJSON(templateJSONFile);
    // console.log(templateData);
    const templateId = templateData.templateId || '';
    const templateVersion = templateData.version || '0.0.1';
    let templatePrivate = templateData.private;
    if (templatePrivate === undefined) {
      templatePrivate = true;
    }
    const templateTags = templateData.tags || ['base'];
    const templateDescription = templateData.description || '';

    // get the schema data
    let templateSchemaDef;
    if (readSchemaDef) {
      const templateSchemaDefFile = path.join(templateFolder, 'schema.json');
      let templateSchemaDefData;
      if (!fs.existsSync(templateSchemaDefFile)) {
        templateSchemaDefData = {};
      } else {
        templateSchemaDefData = await this.readJSON(templateSchemaDefFile);
      }
      templateSchemaDef = templateSchemaDefData;
    }

    const templateSrcFolder = path.join(templateFolder, 'src');
    const templateModelFolder = path.join(templateFolder, 'models');
    if (!fs.existsSync(templateSrcFolder)) {
      console.log(
        colors.yellow(
          'Invalid template context. Please use [snapdev checkout <template>] to switch to a valid template'
        )
      );
      process.exit(1);
    }

    const pushId = await this.getPushId(templateId);

    return {
      templateFolder,
      templateSrcFolder,
      templateModelFolder,
      templateName,
      templateVersion,
      templatePrivate,
      templateTags,
      templateJSONFile,
      username,
      branch,
      templateDescription,
      templateSchemaDef,
      pushId,
      templateId,
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
        console.log(colors.yellow('Invalid file extension'));
        process.exit(1);
      } else {
        newModelFile += '.json';
      }
    }
    // console.log('Creating Model:', newModelFile);

    // create the parent folder for the model.json
    const parentFolder = path.dirname(newModelFile);
    // console.log('parentFolder', parentFolder);
    if (!fs.existsSync(parentFolder)) {
      fs.mkdirSync(parentFolder, { recursive: true });
    }

    // copy the file
    return this.copyStarter(this.starterModelFile, newModelFile);
  }

  clean() {
    const exec = new Clean(this);
    return exec.execute();
  }

  async generate() {
    const exec = new Generate(this);
    return exec.execute();
  }

  hasModelFile(modelFile) {
    return fs.existsSync(modelFile);
  }

  generateForModel(name, templateFolder, templateSrcFolder) {
    let modelName = name;
    const ext = path.extname(modelName);
    if (ext !== '.json' || ext === '') {
      modelName += '.json';
    }

    // find the model file
    console.log('Model filename:', modelName);
    // location 1
    let modelFile = path.join(this.snapdevFolder, 'models', modelName);
    let hasModel = this.hasModelFile(modelFile);
    if (!hasModel) {
      // location 2
      modelFile = path.join(templateFolder, 'models', modelName);
      hasModel = this.hasModelFile(modelFile);
      if (!hasModel) {
        console.log(colors.yellow('Model filename not found'));
        process.exit(1);
      }
    }
    console.log('Model path:', modelFile);

    // generate code
    const generator = new Generator(
      templateSrcFolder,
      modelFile,
      this.distFolder,
      this.program.verbose,
      this.program.silent
    );
    generator.generate();
  }

  validUsername(username) {
    const usernameRule = '^[a-z][a-z0-9-_]*$';
    if (!validator.matches(username, usernameRule)) {
      console.log(colors.yellow('Invalid username format'));
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
    const { branch } = await this.getTemplateContext();
    if (branch.indexOf('/') === -1) {
      console.log(colors.yellow('Please run [snapdev tag --user] to tag the template with the logged in user'));
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
        console.log(colors.yellow('Please run [snapdev login] to log in'));
        process.exit(1);
      } else {
        await this.updateLogin();
        return false;
      }
    }

    await this.updateLogin();
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
        console.log(colors.yellow('Working directory is not a snapdev workspace'));
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
        console.log(colors.yellow('Please run command from the template folder that has the template.json file'));
        process.exit(1);
      } else {
        return false;
      }
    }
    return true;
  }

  copyStarter(fromFile, toFile, mustacheModel = null) {
    // get starter model content
    const modelStarterData = fs.readFileSync(fromFile, 'utf8');
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
      console.log(colors.yellow('The specified file already exists'));
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
