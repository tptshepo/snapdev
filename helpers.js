const mkdirp = require('mkdirp');
const fs = require('fs');
const path = require('path');
const colors = require('colors');

module.exports = {
  cleanDir: function(dirPath, deleteSelf = false, force = false) {
    let files = [];
    try {
      // console.log(path.basename(dirPath));
      if (path.basename(dirPath) === 'node_modules' && !force) {
        return;
      }

      files = fs.readdirSync(dirPath);
    } catch (e) {
      return;
    }
    if (files.length > 0) {
      for (let i = 0; i < files.length; i++) {
        //console.log(colors.yellow(files[i]));

        let filePath = path.join(dirPath, files[i]);
        if (fs.statSync(filePath).isFile()) {
          fs.unlinkSync(filePath);
        } else {
          this.cleanDir(filePath, true, force);
        }
      }
    }
    if (deleteSelf) {
      // console.log('[DELETE]', dirPath);
      fs.rmdirSync(dirPath);
    }
  },

  writeToFile: function(filename, content, callback) {
    mkdirp(path.dirname(filename), function(error) {
      if (error) {
        callback(error, null);
        return;
      }

      fs.writeFile(filename, content, function(error) {
        if (error) {
          callback(error, null);
          return;
        }
        callback(null, {});
      });
    });
  }
};
