const path = require('path');
const fs = require('fs');
const colors = require('colors');

class CLI {
  constructor(program) {
    this.program = program;
    this.currentLocation = process.cwd();
    // console.log('CurrentLocation', this.currentLocation);
    this.templateFolder = path.join(this.currentLocation, 'templates');
    this.modelFolder = path.join(this.currentLocation, 'models');
    this.starterFolder = path.normalize(path.join(__dirname, '..', 'starters'));
    // starters
    this.starterModelFile = path.join(this.starterFolder, 'model.json');
    this.starterSnapdevFile = path.join(this.starterFolder, 'snapdev.json');
  }

  init() {
    // create folders if not found
    if (!fs.existsSync(this.templateFolder)) {
      fs.mkdirSync(this.templateFolder, { recursive: true });
    }
    if (!fs.existsSync(this.modelFolder)) {
      fs.mkdirSync(this.modelFolder, { recursive: true });
    }

    let newSnapdevFile = path.join(this.currentLocation, 'snapdev.json');
    return this.copyStarter(this.starterSnapdevFile, newSnapdevFile);
  }

  inRoot() {
    const snapdevFile = path.join(this.currentLocation, 'snapdev.json');
    return fs.existsSync(snapdevFile);
  }

  create() {
    if (!this.program.template && !this.program.model) {
      return false;
    }

    if (!this.inRoot()) {
      console.log(
        colors.yellow('Please run command from same location as snapdev.json')
      );
    } else {
      if (this.program.model) {
        return this.createModel();
      }

      if (this.program.template) {
        return this.createTemplate();
      }
    }

    return true;
  }

  copyStarter(fromFile, toFile) {
    // get starter model content
    let modelStarterData = fs.readFileSync(fromFile, 'utf8');
    // create the new file if not found
    if (!fs.existsSync(toFile)) {
      try {
        fs.writeFileSync(toFile, modelStarterData);
        console.log('Created:', fromFile);
      } catch (e) {
        console.log(colors.red('Unable to create file'), colors.red(e));
        return false;
      }
    } else {
      console.log(colors.yellow('The specified file already exists.'));
    }
    return true;
  }

  createModel() {
    // validate the file extension
    let newModelFile = path.join(this.modelFolder, this.program.model);
    if (path.extname(newModelFile) !== '.json') {
      console.log(
        colors.red('Invalid model file. Please see --help for more info.')
      );
      return false;
    }
    // console.log('Creating Model:', newModelFile);

    // create the parent folder for the model.json
    let parentFolder = path.dirname(newModelFile);
    console.log('parentFolder', parentFolder);
    if (!fs.existsSync(parentFolder)) {
      fs.mkdirSync(parentFolder, { recursive: true });
    }

    // copy the file
    return this.copyStarter(this.starterModelFile, newModelFile);
  }

  createTemplate() {
    return true;
  }
}

module.exports = CLI;
