const fs = require('fs');
const colors = require('colors');

class ModelManager {
  constructor(modelFileName) {
    this.remoteModelFolder = __dirname + '/../models';
    this.remoteModelName = this.remoteModelFolder + '/' + modelFileName;
    this.localModelFolder = process.cwd() + '/models';
    this.localModelName = this.localModelFolder + '/' + modelFileName;
    this.modelFileName = modelFileName;
  }

  getModelData() {
    // create local model folder if not found
    if (!fs.existsSync(this.localModelFolder)) {
      console.log('Creating local model folder...');
      fs.mkdirSync(this.localModelFolder);
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
