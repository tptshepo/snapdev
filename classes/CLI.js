const path = require('path');
const fs = require('fs');
const colors = require('colors');
const mustache = require('mustache');
const validator = require('validator');
const helpers = require('../helpers');
const Generator = require('./Generator');
const json = require('json-update');

/**
 * The CLI is the main class to the commands executed on the command line
 * snapdev will follow a similar approach to GIT commands
 * =====local=====
 * initialise snapdev
 *      $ snapdev init
 * create or switch to a template
 *      $ snapdev checkout java-app
 * create model
 *      $ snapdev add model.json
 * generate source code
 *      $ snapdev generate --clear
 *      $ snapdev generate --model User.json --clear
 *
 * =====online=====
 * login
 *      $ snapdev login
 * logout
 *      $ snapdev logout
 * push
 *      $ snapdev tag java-app --username tptshepo --version 1.1.0
 *      $ snapdev push tptshepo/java-app:1.1.0
 * pull
 *      $ snapdev pull snapdev/nodejs-api:latest
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
    try {
      await json.update('snapdev.json', { branch: this.program.template });
      console.log('Switched to', this.program.template);
    } catch (error) {
      console.log(colors.yellow('Unable to modify snapdev.json', error));
    }

    return true;
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
      templateSrcFolder
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
    let mergedData = mustache.render(modelStarterData, mustacheModel);

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
