const fs = require('fs');
const dir = require('../lib/node-dir');
const path = require('path');

class ModelManager {
  constructor() {}

  getData(modelFileName) {
    return JSON.parse(fs.readFileSync(modelFileName, 'utf8'));
  }

  getAllFiles(modelFolder) {
    let hasFiles = dir.files(modelFolder, {
      sync: true,
    });
    if (!hasFiles) {
      return [];
    }

    let files = dir
      .files(modelFolder, {
        sync: true,
      })
      .filter(function (file) {
        return file.indexOf('.json') > -1;
      })
      .map((f) => {
        return f.replace(path.join(modelFolder, '/'), '');
      });

    return files;
  }
}

module.exports = ModelManager;
