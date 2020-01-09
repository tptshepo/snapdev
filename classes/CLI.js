const path = require('path');
const fs = require('fs');
const colors = require('colors');
const mustache = require('mustache');
const validator = require('validator');
const helpers = require('../helpers');
const Generator = require('./Generator');

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

  generate() {
    // make sure we are in snapdev root folder
    this.checkSnapdevRoot();

    if (this.program.clear) {
      // clean dist folder
      helpers.cleanDir(this.distFolder);
    }

    // find the template to run
    let templateFolder = path.join(this.templateFolder, this.program.template);
    let templateSrcFolder = path.join(templateFolder, 'src');

    console.log('Template root:', templateFolder);
    console.log('Template src:', templateSrcFolder);
    if (!fs.existsSync(templateSrcFolder)) {
      console.log(colors.yellow('Template source code folder not found.'));
      process.exit(1);
    }
    // check for the template.json file
    if (!fs.existsSync(path.join(templateFolder, 'template.json'))) {
      console.log(colors.yellow('template.json not found'));
      process.exit(1);
    }

    let templateName;
    if (this.program.template.indexOf('/') > -1) {
      templateName = this.program.template.split('/')[1];
    } else {
      templateName = this.program.template;
    }

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
      console.log(colors.yellow('Model filename not found'));
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

  create() {
    if (!this.program.template && !this.program.model) {
      return false;
    }

    if (this.program.template) {
      return this.createTemplate();
    }

    if (this.program.model) {
      return this.createModel();
    }

    return true;
  }

  createModel() {
    this.checkTemplateRoot();

    // validate the file extension
    let newModelFile = path.join(
      this.currentLocation,
      'models',
      this.program.model
    );
    if (path.extname(newModelFile) !== '.json') {
      console.log(colors.red('Invalid model file.'));
      return false;
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

  createTemplate() {
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
      fs.mkdirSync(srcFolder, { recursive: true });
    } else {
      console.log(colors.yellow('The specified name already exists.'));
      process.exit(1);
    }

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
        console.log(colors.red('Unable to create file'), colors.red(e));
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
