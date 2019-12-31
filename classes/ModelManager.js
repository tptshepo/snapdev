const fs = require('fs');
const colors = require('colors');
const path = require('path');
const copydir = require('copy-dir');

class ModelManager {
  constructor(modelFileName) {
    this.remoteModelsFolder = path.join(__dirname, '..', 'models');
    this.remoteModelName = path.join(this.remoteModelsFolder, modelFileName);
    this.localModelsFolder = path.join(process.cwd(), 'models');
    this.localModelName = path.join(this.localModelsFolder, modelFileName);
    this.modelFileName = modelFileName;
  }

  pull() {
    // create local model folder if not found
    if (!fs.existsSync(this.localModelsFolder)) {
      console.log('Creating local models folder...');
      fs.mkdirSync(this.localModelsFolder);
    }

    // copy models folder to local folder
    console.log('Pulling models...');
    if (!fs.existsSync(this.localModelName)) {
      copydir.sync(this.remoteModelName, this.localModelName, {
        utimes: true, // keep add time and modify time
        mode: true, // keep file mode
        cover: true // cover file when exists, default is true
      });
    }
    console.log('Pulling models complete.');
  }

  getModelData() {
    // create local model folder if not found
    if (!fs.existsSync(this.localModelsFolder)) {
      console.log('Creating local model folder...');
      fs.mkdirSync(this.localModelsFolder);
    }

    let modelData = {};
    // check if file exists
    if (fs.existsSync(this.localModelName)) {
      modelData = JSON.parse(fs.readFileSync(this.localModelName, 'utf8'));
    } else {
      console.log(
        colors.red('Data model file not found: ' + this.localModelName)
      );
      process.exit(1);
    }
    return modelData;
  }
}

module.exports = ModelManager;
