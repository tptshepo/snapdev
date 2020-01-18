const dir = require('../lib/node-dir');
const colors = require('colors');
const path = require('path');

class TemplateManager {
  constructor(templateSrcFolder) {
    this.templateSrcFolder = templateSrcFolder;
  }

  static getLocalTemplates(rootTemplateFolder) {
    let hasFiles = dir.files(rootTemplateFolder, {
      sync: true
    });
    if (!hasFiles) {
      return [];
    }

    let files = dir
      .files(rootTemplateFolder, {
        sync: true
      })
      .filter(function(file) {
        return file.indexOf('template.json') > -1;
      })
      .map(f => {
        return f
          .replace(path.join(rootTemplateFolder, '/'), '')
          .replace('\\', '/') // for windows
          .replace('/template.json', '');
      });

    return files;
  }

  get() {
    let template = {
      f: this.templateSrcFolder,
      dir: this.templateSrcFolder,
      files: []
    };
    let files = this.builder({
      dir: template.dir
    });
    template.files = files;

    return template;
  }

  builder(options) {
    let hasFiles = dir.files(options.dir, {
      sync: true
    });
    if (!hasFiles) {
      console.log(colors.yellow('Template folder is empty.'));
      return [];
    }

    let files = dir
      .files(options.dir, {
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
            .replace(path.join(options.dir, '/'), '')
            .replace('.java.txt', '.java')
            .replace('.css.txt', '.css')
            .replace('.html.txt', '.html')
            .replace('.ts.txt', '.ts')
            .replace('.js.txt', '.js')
            .replace('.cs.txt', '.cs')
            .replace('.scss.txt', '.scss')
        };
      });

    return files;
  }
}

module.exports = TemplateManager;
