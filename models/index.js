const dir = require('../lib/node-dir');
const colors = require('colors');
const packages = require('./packages');

const builder = map => {
  const baseDir = __dirname + '/../templates/' + map.dir;
  const relDir =
    __dirname.replace('/models', '') + '/templates/' + map.dir + '/';

  let files = dir
    .files(baseDir, {
      sync: true
    })
    .filter(function(file) {
      return file.indexOf('.DS_Store') === -1;
    })
    .map(f => {
      return {
        src: f
      };
    })
    .map(f => {
      return {
        src: f.src,
        dist: f.src
          .replace(relDir, '')
          .replace('.java.txt', '.java')
          .replace('.css.txt', '.css')
          .replace('.html.txt', '.html')
          .replace('.ts.txt', '.ts')
          .replace('.cs.txt', '.cs')
          .replace('.scss.txt', '.scss')
      };
    });
  // .map(f => {
  //   // replace file names
  //   return {
  //     src: f.src,
  //     dist: f.dist
  //       .replace(/\$model-name/g, '{{dashlcase}}')
  //       .replace(/\$Models/g, '{{ptitlecase}}')
  //       .replace(/\$Model/g, '{{titlecase}}')
  //   };
  // });

  return files;
};

module.exports = {
  find: function(packageName) {
    const snapPackages = packages.list.filter(m => {
      return m.name === packageName;
    });
    let snapPackage;

    if (snapPackages.length === 0) {
      console.log(colors.red('snapdev package not found: ' + packageName));
      process.exit();
    } else {
      snapPackage = snapPackages[0];
      let files = builder({
        dir: snapPackage.dir
      });
      snapPackage.files = files;
      console.log(colors.green('snapdev Package: ' + snapPackage.name));
    }

    return snapPackage;
  }
};
