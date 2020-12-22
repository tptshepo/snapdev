const fs = require('fs');
const path = require('path');
const dir = require('../lib/node-dir');

class ModelManager {
  getData(modelFileName) {
    return JSON.parse(fs.readFileSync(modelFileName, 'utf8'));
  }

  getAllFiles(modelFolder) {
    const hasFiles = dir.files(modelFolder, {
      sync: true,
    });
    if (!hasFiles) {
      return [];
    }

    const files = dir
      .files(modelFolder, {
        sync: true,
      })
      .filter(function (file) {
        return file.indexOf('.json') > -1;
      })
      .map((f) => f.replace(path.join(modelFolder, '/'), ''));

    return files;
  }
}

module.exports = ModelManager;
