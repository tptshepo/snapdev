const fs = require('fs');

class ModelManager {
  constructor(modelFileName) {
    this.modelFileName = modelFileName;
  }

  getData() {
    return JSON.parse(fs.readFileSync(this.modelFileName, 'utf8'));
  }
}

module.exports = ModelManager;
