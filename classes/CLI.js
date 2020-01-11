const path = require('path');
const fs = require('fs');
const colors = require('colors');
const mustache = require('mustache');
const validator = require('validator');
const helpers = require('../helpers');
const Generator = require('./Generator');
const json = require('json-update');
const semver = require('semver');

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
 * clone
 *      $ snapdev clone tptshepo/java-app --version 1.1
 * push
 *      $ snapdev tag --username tptshepo --version 1.1.0
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
      templateName,
      templateFolder,
      templateUsername,
      templateVersion
    } = await this.getTemplateContext();
    console.log('Template name:', templateName);
    console.log('Template version:', templateVersion);
    console.log('Template username:', templateUsername);
    console.log('Template root:', templateFolder);
    return true;
  }

  async tag() {
    this.checkSnapdevRoot();
    let {
      templateName,
      templateFolder,
      templateUsername,
      templateVersion,
      templateJSONFile
    } = await this.getTemplateContext();

    let hasValidAction = false;

    // set version
    if (this.program.version !== undefined) {
      hasValidAction = true;
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
        console.log(templateName, 'set to version', version);
      }
    }

    // set username
    if (this.program.username !== undefined) {
      hasValidAction = true;
      let username = this.program.username;
      const valid = this.validUsername(username);
      if (valid) {
        // update template.json
        const updated = await this.updateJSON(templateJSONFile, {
          username: username
        });
        if (updated) {
          console.log(templateName, 'set to username', username);
        }
      }
    }

    return hasValidAction;
  }

  async checkout() {
    this.checkSnapdevRoot();

    // validate template name against short and full name
    const shortName = '^[a-z][a-z0-9-_]*$';
    const fullName = '^[a-z][a-z0-9-_]*[/][a-z0-9-_]*$';
    let templateName;
    if (this.program.template.indexOf('/') > -1) {
      // username/template-name
      if (!validator.matches(this.program.template, fullName)) {
        console.log(colors.yellow('Invalid template name.'));
        return false;
      }
      templateName = this.program.template.split('/')[1];
    } else {
      // template-name
      if (!validator.matches(this.program.template, shortName)) {
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
          version: '0.0.1',
          username: '' // Replace with authenticated user
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
    const updated = await this.updateJSON('snapdev.json', {
      branch: this.program.template
    });
    if (updated) {
      console.log('Switched to', this.program.template);
    }

    return true;
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
    const templateName = snapdevData.branch;

    let templateFolder = path.join(this.templateFolder, templateName);
    if (!fs.existsSync(path.join(templateFolder, 'template.json'))) {
      console.log(colors.yellow('template.json not found'));
      process.exit(1);
    }

    /// get template details
    const templateJSONFile = path.join(templateFolder, 'template.json');
    const templateData = await this.readJSON(templateJSONFile);
    const templateVersion = templateData.version;
    const templateUsername = templateData.username;

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
      templateName,
      templateFolder,
      templateSrcFolder,
      templateVersion,
      templateUsername,
      templateJSONFile
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
      templateName,
      templateFolder,
      templateSrcFolder
    } = await this.getTemplateContext();

    if (this.program.clear) {
      // clean dist folder
      helpers.cleanDir(this.distFolder);
    }

    console.log('Template root:', templateFolder);
    console.log('Template src:', templateSrcFolder);
    console.log('Template name:', templateName);

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
}

module.exports = CLI;
