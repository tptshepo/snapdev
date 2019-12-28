const dir = require('../lib/node-dir');

module.exports = {
  getTemplate: function(templateName) {
    const baseDir = __dirname;
    return dir
      .files(baseDir, 'dir', function(err, files) {}, {
        sync: true,
        shortName: true,
        recursive: false
      })
      .filter(d => {
        return d === templateName;
      })
      .map(f => {
        return { name: f, dir: f, files: [] };
      });
  },

  list: function() {
    const baseDir = __dirname;
    return dir
      .files(baseDir, 'dir', function(err, files) {}, {
        sync: true,
        shortName: true,
        recursive: false
      })
      .map(f => {
        return { name: f, dir: f, files: [] };
      });
  }
};
