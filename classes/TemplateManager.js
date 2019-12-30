const dir = require('../lib/node-dir');
const colors = require('colors');
const fs = require('fs');

class TemplateManager {
  constructor() {
    this.templateFolder = process.cwd() + '/templates';
  }

  download() {}

  find(templateName) {
    let template;
    const list = this.getTemplate(templateName);
    if (list.length === 0) {
      console.log(colors.red('Template not found: ' + templateName));
      process.exit();
    } else {
      template = list[0];
      let files = this.builder({
        dir: template.dir
      });
      template.files = files;
      console.log(colors.green('Template: ' + template.name));
    }
    return template;
  }

  getTemplate(templateName) {
    // check if the folder exists
    if (!fs.existsSync(this.templateFolder)) {
      console.log(
        colors.red('Template folder not found. Try pulling the template.')
      );
      process.exit(1);
    }

    return dir
      .files(this.templateFolder, 'dir', function(err, files) {}, {
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
  }

  list() {
    return dir
      .files(this.templateFolder, 'dir', function(err, files) {}, {
        sync: true,
        shortName: true,
        recursive: false
      })
      .map(f => {
        return { name: f, dir: f, files: [] };
      });
  }

  builder(map) {
    const selectedTemplateFolder = this.templateFolder + '/' + map.dir;

    let files = dir
      .files(selectedTemplateFolder, {
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
            .replace(selectedTemplateFolder + '/', '')
            .replace('.java.txt', '.java')
            .replace('.css.txt', '.css')
            .replace('.html.txt', '.html')
            .replace('.ts.txt', '.ts')
            .replace('.cs.txt', '.cs')
            .replace('.scss.txt', '.scss')
        };
      });

    return files;
  }
}

module.exports = TemplateManager;
