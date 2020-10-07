const colors = require('colors');
const path = require('path');
const dir = require('../lib/node-dir');

class TemplateManager {
  constructor(templateSrcFolder) {
    this.templateSrcFolder = templateSrcFolder;
  }

  static getLocalTemplates(rootTemplateFolder) {
    const hasFiles = dir.files(rootTemplateFolder, {
      sync: true,
    });
    if (!hasFiles) {
      return [];
    }

    const files = dir
      .files(rootTemplateFolder, {
        sync: true,
      })
      .filter(function (file) {
        return file.indexOf('template.json') > -1;
      })
      .filter(function (file) {
        return file.indexOf('__MACOSX') === -1;
      })
      .map((f) =>
        f
          .replace(path.join(rootTemplateFolder, '/'), '')
          .replace('\\', '/') // for windows
          .replace('/template.json', '')
      );

    return files;
  }

  get() {
    const template = {
      f: this.templateSrcFolder,
      dir: this.templateSrcFolder,
      files: [],
    };
    const files = this.builder({
      dir: template.dir,
    });
    template.files = files;

    return template;
  }

  builder(options) {
    const hasFiles = dir.files(options.dir, {
      sync: true,
    });
    if (!hasFiles) {
      console.log(colors.yellow('Template folder is empty.'));
      return [];
    }

    const files = dir
      .files(options.dir, {
        sync: true,
      })
      .filter(function (file) {
        return file.indexOf('.DS_Store') === -1;
      })
      .map((f) => ({
        src: f,
      }))
      .map((f) => ({
        src: f.src,
        dist: f.src
          .replace(path.join(options.dir, '/'), '')
          .replace('.sd', '')
          .replace('.java.txt', '.java')
          .replace('.css.txt', '.css')
          .replace('.html.txt', '.html')
          .replace('.ts.txt', '.ts')
          .replace('.js.txt', '.js')
          .replace('.cs.txt', '.cs')
          .replace('.scss.txt', '.scss')
          .replace('.json.txt', '.json'),
      }));

    return files;
  }
}

module.exports = TemplateManager;
