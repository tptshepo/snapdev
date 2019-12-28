const dir = require('../lib/node-dir');
const colors = require('colors');
const templates = require('../templates');

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
  find: function(templateName) {
    let template;
    const list = templates.getTemplate(templateName);
    if (list.length === 0) {
      console.log(colors.red('snapdev template not found: ' + templateName));
      process.exit();
    } else {
      template = list[0];
      let files = builder({
        dir: template.dir
      });
      template.files = files;
      console.log(colors.green('snapdev template: ' + template.name));
    }
    return template;
  }
};
