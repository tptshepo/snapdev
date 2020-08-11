const path = require('path');
const fs = require('fs-extra');
const colors = require('colors');
const mustache = require('mustache');
const validator = require('validator');
const helpers = require('../helpers');
const Generator = require('./generator');
const json = require('json-update');
const semver = require('semver');
const semverInc = require('semver/functions/inc');
const config = require('config');
const homePath = require('home-path');
const request = require('superagent');
const archiver = require('archiver');
const tmp = require('tmp-promise');
const AdmZip = require('adm-zip');
const chalk = require('chalk');
const columns = require('cli-columns');
const TemplateManager = require('./templateManager');
const inquirer = require('inquirer');
const klawSync = require('klaw-sync');
const dir = require('../lib/node-dir');

class CLI {
  constructor(program, version) {
    this.program = program;
    this.version = version;
    this.currentLocation = process.cwd();
    this.snapdevFolder = this.currentLocation;
    this.templateFolder = path.join(this.currentLocation, 'templates');
    this.starterFolder = path.normalize(path.join(__dirname, '..', 'starters'));
    this.distFolder = path.join(this.currentLocation, 'dist');
    this.modelsFolder = path.join(this.currentLocation, 'models');
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
      version: this.version,
    };
    // API
    this.snapdevHost = config.snapdevHost;
    this.usersAPI = config.snapdevHost + config.apiv1 + config.usersAPI;
    this.templatesAPI = config.snapdevHost + config.apiv1 + config.templatesAPI;
    this.apiv1 = this.snapdevHost + config.apiv1;
    //Auth
    this.username = '';
    this.token = '';
    this.cred = null;
  }

  async model() {
    this.checkSnapdevRoot();
    let { templateModelFolder } = await this.getTemplateContext();

    if (this.program.pwd) {
      console.log(templateModelFolder);
      return true;
    }

    let modelList = [];
    let files = dir.files(templateModelFolder, {
      sync: true,
    });
    if (!files) {
      modelList = [];
    } else {
      modelList = files.map((f) => {
        return f.replace(path.join(templateModelFolder, '/'), '');
      });
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
    let { templateSrcFolder } = await this.getTemplateContext();

    let hasAction = false;
    /**============================ */
    // ext
    /**============================ */
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
        let paths = klawSync(templateSrcFolder, {
          nodir: true,
          filter: filterFn,
        });
        let files = paths.map((p) => p.path);
        console.log('File count:', files.length);

        for (let index = 0; index < files.length; index++) {
          const file = files[index];
          // console.log('File:', file);
          if (path.extname(file) !== '.sd') {
            let newFile = file + '.sd';
            await fs.move(file, newFile);
            console.log('Updated:', newFile);
          }
        }
        console.log();
        console.log(colors.green('Done.'));
        // console.dir(files);
      } catch (err) {
        console.log(colors.yellow('Unable to update extensions:'), err.message);
        process.exit(1);
      }
    }

    return hasAction;
  }

  async preReset() {
    let { branch } = await this.getTemplateContext();

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
    let templateName = this.program.template;

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
    this.checkSnapdevRoot();

    let templateName = this.program.template;

    if (!this.program.force) {
      await this.preDelete();
    }

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
      try {
        await request
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
      await request
        .delete(this.usersAPI + '/me')
        .set('Authorization', `Bearer ${this.token}`)
        .send();
      console.log('Account deleted');
    } catch (err) {
      if (err.status === 400) {
        const jsonError = JSON.parse(err.response.res.text);
        throw new Error(jsonError.error.message);
      } else {
        throw new Error(err.message);
      }
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

    let srcFolder = this.distFolder;
    let distFolder = parentProjectFolder;

    console.log('Destination:', distFolder);

    const filterCopy = async (src, dist) => {
      if (src !== this.distFolder) {
        console.log(
          'Copied:',
          src.replace(path.join(this.distFolder, '/'), '')
        );
      }
      return true;
    };

    // copy the files but don't override
    await fs.copy(srcFolder, distFolder, {
      overwrite: this.program.force,
      filter: filterCopy,
    });

    console.log('');
    console.log(colors.green('Done.'));

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
        console.log(colors.yellow('No remote templates found'));
      } else {
        console.log(
          colors.yellow('You must be logged in to see your remote templates')
        );
      }
    } else {
      let values = list.map((t) => {
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
        .post(this.templatesAPI + '/pull')
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

  async clone(isPull) {
    // check snapdev root
    this.checkSnapdevRoot();
    // check login
    await this.checkLogin();

    let templateName;
    let action;
    let cloneVersion = 'latest';

    if (this.program.version) {
      cloneVersion = this.program.version;
    }

    if (!isPull) {
      // clone request
      action = 'Cloning';
      templateName = this.program.template;
    } else {
      // pull request
      action = 'Pulling';
      let { branch, templateVersion } = await this.getTemplateContext();
      templateName = branch;

      // pull the same version as the current template
      cloneVersion = templateVersion;
    }

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
          'The destination location is not empty, add --force to override'
        )
      );
      process.exit(1);
    }

    // download zip file
    const tempFile = await this.makeTempFile();
    let distZipFile = tempFile + '.zip';

    console.log(action, 'template....');
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

    // delete the old folder
    if (fs.existsSync(newTemplateLocation)) {
      await fs.remove(newTemplateLocation);
    }

    try {
      // download zip file
      await this.downloadZip(
        cred.token,
        templateName,
        cloneVersion,
        distZipFile
      );

      // console.log('Zip File:', distZipFile);
      // console.log('Zip size:', this.getFilesizeInBytes(distZipFile));

      console.log(
        'Download size:',
        this.getFilesizeInBytes(distZipFile),
        'bytes'
      );
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
    // check for snapdev root
    this.checkSnapdevRoot();

    // check for login
    await this.checkLogin();

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
    } = await this.getTemplateContext(true, true);

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

    // auto version bump
    let newVersion = templateVersion;
    if (this.program.force) {
      newVersion = semverInc(templateVersion, 'patch');
      // save back to template file
      const updated = await this.updateJSON(templateJSONFile, {
        version: semver.clean(newVersion),
      });
      if (updated) {
        console.log('Version bumped to', newVersion);
      }
    }

    // zip template folder
    const tempFile = await this.makeTempFile();
    let distZipFile = tempFile + '.zip';

    try {
      await this.zipDirectory(templateFolder, distZipFile);
    } catch (e) {
      console.log(colors.yellow('Unable to create zip file'), colors.yellow(e));
      process.exit(1);
    }

    // upload template
    // console.log(branch, newVersion, templatePrivate, templateTags);
    console.log('Pushing...');
    console.log('Upload size:', this.getFilesizeInBytes(distZipFile), 'bytes');
    try {
      const cred = await this.getCredentials();
      await request
        .post(this.templatesAPI + '/push')
        .set('Authorization', `Bearer ${cred.token}`)
        .field('name', branch)
        .field('description', templateDescription)
        .field('schemaDef', JSON.stringify(templateSchemaDef))
        .field('version', newVersion)
        .field('private', templatePrivate)
        .field('tags', templateTags.join(','))
        .attach('template', distZipFile);
      console.log('Push Succeeded');
    } catch (err) {
      if (err.status === 400) {
        const jsonError = JSON.parse(err.response.res.text);
        throw new Error(jsonError.error.message);
      } else {
        throw new Error(err.message);
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

      await request
        .get(this.usersAPI + '/me')
        .set('Authorization', `Bearer ${cred.token}`)
        .send();
      console.log('Logged in as:', cred.username);
      console.log('Login Succeeded');
    } catch (err) {
      console.log(colors.yellow(err.message));
      throw new Error(err.message);
    }

    return true;
  }

  async logout() {
    // call logout API
    console.log('Logging out...');

    try {
      const cred = await this.getCredentials();

      if (!this.program.local) {
        await request
          .post(this.usersAPI + '/logout')
          .set('Authorization', `Bearer ${cred.token}`)
          .send();
      }

      await this.updateJSON(this.credentialFile, {
        username: '',
        token: '',
      });
      console.log('Removed login credentials');
    } catch (err) {
      if (this.program.force) {
        await this.updateJSON(this.credentialFile, {
          username: '',
          token: '',
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

    let hasErrors = false;

    if (
      this.program.username === undefined ||
      validator.isEmpty(this.program.username)
    ) {
      console.log(colors.yellow('--username is required'));
      hasErrors = true;
    }

    if (!this.program.force) {
      if (this.program.password !== this.program.password2) {
        console.log(colors.yellow('Passwords mismatch'));
        hasErrors = true;
      }
    } else {
      if (
        this.program.password === undefined ||
        validator.isEmpty(this.program.password)
      ) {
        console.log(colors.yellow('--password is required'));
        hasErrors = true;
      }
    }

    if (
      this.program.email === undefined ||
      !validator.isEmail(this.program.email)
    ) {
      console.log(colors.yellow('--email is required'));
      hasErrors = true;
    }

    if (hasErrors) {
      process.exit(1);
    }

    // call sign up API
    try {
      await request.post(this.usersAPI + '/signup').send({
        displayName: this.program.username,
        email: this.program.email,
        username: this.program.username,
        password: this.program.password,
      });
      console.log('Account created');
    } catch (err) {
      if (err.status === 400) {
        const jsonError = JSON.parse(err.response.res.text);
        throw new Error(jsonError.error.message);
      } else {
        throw new Error(err.message);
      }
    }
    return true;
  }

  async inputLogin() {
    console.log(
      'Login with your snapdev username to push and clone templates from snapdev online repository'
    );

    let list = [];

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
        password: this.program.password,
      });
      await this.updateJSON(this.credentialFile, {
        username: this.program.username,
        token: response.body.data.token,
      });
      console.log(`Logged in as: ${this.program.username}`);

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

    // create models folder if not found
    let modelsFolder = path.join(snapdevFolder, 'models');
    if (!fs.existsSync(modelsFolder)) {
      fs.mkdirSync(modelsFolder, { recursive: true });
    }
    let newModelFile = path.join(modelsFolder, 'default.json');

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
      const response = await request.get(this.apiv1 + '/version').send();
      apiVersion = response.body.version;
    } catch (e) {
      apiVersion = 'Network error';
    }

    console.log('API endpoint:', config.snapdevHost);
    console.log('API version:', apiVersion);
    console.log('Logged in as:', username);

    this.checkSnapdevRoot();

    let {
      branch,
      templateFolder,
      templateVersion,
      templatePrivate,
      templateTags,
    } = await this.getTemplateContext(false);

    console.log('Template name:', branch);
    console.log('Template version:', templateVersion);
    console.log('Template tags:', templateTags.join(','));
    console.log('Template acl:', templatePrivate ? 'private' : 'public');
    console.log('Template root:', templateFolder);
    return true;
  }

  async tag() {
    this.checkSnapdevRoot();
    let {
      templateFolder,
      username,
      templateJSONFile,
      branch,
      templateName,
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
        version: semver.clean(version),
      });
      if (updated) {
        console.log(branch, 'set to version', version);
      }
    }

    /**============================ */
    // set tags
    /**============================ */
    if (this.program.tags !== undefined) {
      let tags = this.program.tags;
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

    /**============================ */
    // set description
    /**============================ */
    if (this.program.description !== undefined) {
      let newDescription = this.program.description;
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

    /**============================ */
    // set name
    /**============================ */
    if (this.program.name !== undefined) {
      let newName = this.program.name;
      // make sure it's a short name
      if (!validator.matches(newName, this.shortTemplateNameRule)) {
        console.log(colors.yellow('Invalid template name'));
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
            'Template name already exists at that location',
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

        await this.updateJSON(templateJSONFile, {
          name: newName,
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
    // tag template as public or private
    /**============================ */
    // setting must take effect when pushing to online.
    if (this.program.private && this.program.public) {
      console.log(
        colors.yellow('Cannot use --private and --public at the same time')
      );
      process.exit(1);
    }
    if (this.program.private || this.program.public) {
      let isPrivate = this.program.private !== undefined;

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
    let programTemplate = this.program.template;

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
        templateName = cred.username + '/' + programTemplate;
      } else {
        templateName = programTemplate;
      }
    }

    // get new folder name
    let newTemplateFolder = path.join(this.templateFolder, templateName);
    let srcFolder = path.join(newTemplateFolder, 'src');
    // make sure template folder does not exists
    if (fs.existsSync(srcFolder)) {
      console.log(colors.yellow('Template name already exists'));
      process.exit(1);
    }

    // create src folder
    fs.mkdirSync(srcFolder, { recursive: true });

    // save template.json in the folder
    this.copyStarter(
      this.starterTemplateJsonFile,
      path.join(newTemplateFolder, 'template.json'),
      {
        name: templateName,
        version: '0.0.1',
      }
    );

    // save schema.json in the folder
    this.copyStarter(
      this.starterSchemaFile,
      path.join(newTemplateFolder, 'schema.json'),
      {
        name: templateName,
      }
    );

    // copy readme file
    // TODO: Render all the token values from the generator
    this.copyStarter(
      this.starterReadMeFile,
      path.join(newTemplateFolder, 'README.md'),
      {
        name: templateName,
      }
    );

    // copy template sample file
    this.copyStarter(
      this.starterSampleTemplateFile,
      path.join(srcFolder, '{{titlecase}}.java.txt'),
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

    // switch context
    await this.switchContextBranch(templateName);

    return true;
  }

  hasTemplate(templateName) {
    let newTemplateFolder = path.join(this.templateFolder, templateName);
    let srcFolder = path.join(newTemplateFolder, 'src');
    return fs.existsSync(srcFolder);
  }

  async checkout() {
    this.checkSnapdevRoot();

    // validate template name against short and full name
    let templateName;
    let programTemplate = this.program.template;

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
          templateName = cred.username + '/' + programTemplate;
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
      json.load(filename, function (error, data) {
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

  async getTemplateContext(exit = true, readSchemaDef = false) {
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
    const templateVersion = templateData.version || '0.0.1';
    let templatePrivate = templateData.private;
    if (templatePrivate === undefined) {
      templatePrivate = true;
    }
    const templateTags = templateData.tags || ['component'];
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

    let templateSrcFolder = path.join(templateFolder, 'src');
    let templateModelFolder = path.join(templateFolder, 'models');
    if (!fs.existsSync(templateSrcFolder)) {
      console.log(
        colors.yellow(
          'Invalid template context. Please use [snapdev checkout <template>] to switch to a valid template'
        )
      );
      process.exit(1);
    }

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
    let parentFolder = path.dirname(newModelFile);
    // console.log('parentFolder', parentFolder);
    if (!fs.existsSync(parentFolder)) {
      fs.mkdirSync(parentFolder, { recursive: true });
    }

    // copy the file
    return this.copyStarter(this.starterModelFile, newModelFile);
  }

  async clean() {
    // make sure we are in snapdev root folder
    this.checkSnapdevRoot();

    // clean dist folder
    helpers.cleanDir(this.distFolder, false, this.program.force);

    console.log('Cleaned!');

    return true;
  }

  async generate() {
    // make sure we are in snapdev root folder
    this.checkSnapdevRoot();

    // check if the model is online or local
    let isOnline = false;
    let modelName = this.program.model;
    if (
      modelName.indexOf('http://') > -1 ||
      modelName.indexOf('https://') > -1
    ) {
      isOnline = true;
    }

    if (isOnline) {
      await this.checkLogin();
      /** Get the contents from the API */
      console.log(`Retrieving the online model from ${modelName}`);
      // console.log(`Bearer ${this.token}`);
      let apiData;
      try {
        const response = await request
          .get(modelName)
          .set('Authorization', `Bearer ${this.token}`)
          .send();
        apiData = response.body.data;
        /** Save the model to file */
        const modelDef = JSON.parse(apiData.modelDef);
        const modelDefFileName = path.join(
          this.modelsFolder,
          apiData.modelDefName + '.json'
        );
        this.updateJSON(modelDefFileName, modelDef);
        modelName = apiData.modelDefName + '.json';
      } catch (err) {
        if (err.status === 400) {
          const jsonError = JSON.parse(err.response.res.text);
          throw new Error(jsonError.error.message);
        } else {
          throw new Error(err.message);
        }
      }

      let { branch, templateVersion } = await this.getTemplateContext(false, false);

      if (branch === '') {
        // local template is missing, clone it
        this.program.version = apiData.templateVersion;
        this.program.template = apiData.templateOrigin;
        await this.clone(false);
      } else {
        /** Check if the local template matches the model template version */

        const onlineVersion = apiData.templateVersion;
        const localVersion = templateVersion;

        if (onlineVersion !== localVersion) {
          console.log('The online model was created for a template version that is different to the local template.');
          console.log('Online version:', onlineVersion);
          console.log('Local version:', localVersion);

          if (this.program.force) {
            console.log(
              colors.yellow(
                'The generation will continue as per the --force flag'
              )
            );
          } else {
            throw new Error('Template versions mismatch. Use --force if you want to continue.');
          }
        }
      }
    }

    let {
      branch,
      templateFolder,
      templateSrcFolder,
    } = await this.getTemplateContext();

    if (this.program.clear) {
      // clean dist folder
      helpers.cleanDir(this.distFolder, false, this.program.force);
    }

    // console.log('Template root:', templateFolder);
    // console.log('Template src:', templateSrcFolder);
    console.log('Template name:', branch);

    this.generateForModel(modelName, templateFolder, templateSrcFolder);

    return true;
  }

  hasModelFile(modelFile) {
    return fs.existsSync(modelFile);
  }

  generateForModel(modelName, templateFolder, templateSrcFolder) {
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
      this.program.verbose
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
    let { branch } = await this.getTemplateContext();
    if (branch.indexOf('/') === -1) {
      console.log(
        colors.yellow(
          'Please run [snapdev tag --user] to tag the template with the logged in user'
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
