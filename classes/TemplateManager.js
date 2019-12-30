const dir = require('../lib/node-dir');
const colors = require('colors');
const fs = require('fs');
const copydir = require('copy-dir');

class TemplateManager {
  constructor(templateName) {
    this.remoteRepo = __dirname + '/../templates';
    this.remoteRepoTemplate = this.remoteRepo + '/' + templateName;
    this.localRepo = process.cwd() + '/templates';
    this.localRepoTemplate = this.localRepo + '/' + templateName;
    this.templateName = templateName;
  }

  pull() {
    // create local template folder if not found
    if (!fs.existsSync(this.localRepo)) {
      console.log('Creating local template folder...');
      fs.mkdirSync(this.localRepo);
    }

    // copy template folder to local folder
    console.log('Pulling template...');
    if (!fs.existsSync(this.localRepoTemplate)) {
      copydir.sync(this.remoteRepoTemplate, this.localRepoTemplate, {
        utimes: true, // keep add time and modify time
        mode: true, // keep file mode
        cover: true // cover file when exists, default is true
      });
    }
    console.log('Pulling complete.');
  }

  find() {
    let template;
    const list = this.getTemplate(this.templateName);
    if (list.length === 0) {
      console.log(colors.red('Template not found: ' + this.templateName));
      process.exit(1);
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

  getTemplate() {
    let pullRequested = false;

    // check if the folder exists
    if (!fs.existsSync(this.localRepoTemplate)) {
      console.log(
        colors.yellow(
          'Local template not found. Will try to pull it from the repository...'
        )
      );
      // pull template from repo, if fails, exit.
      if (!fs.existsSync(this.remoteRepoTemplate)) {
        console.log(colors.red('Template not found on the repository.'));
        process.exit(1);
      } else {
        pullRequested = true;
        this.pull();
      }
    }

    // last template check
    if (!fs.existsSync(this.localRepoTemplate)) {
      if (pullRequested) {
        console.log(colors.red('Failed to pull template from repository.'));
      } else {
        console.log(colors.red('Template not found.'));
      }
      process.exit(1);
    }

    return dir
      .files(this.localRepo, 'dir', function(err, files) {}, {
        sync: true,
        shortName: true,
        recursive: false
      })
      .filter(d => {
        return d === this.templateName;
      })
      .map(f => {
        return { name: f, dir: f, files: [] };
      });
  }

  list() {
    return dir
      .files(this.remoteRepo, 'dir', function(err, files) {}, {
        sync: true,
        shortName: true,
        recursive: false
      })
      .map(f => {
        return { name: f, dir: f, files: [] };
      });
  }

  builder(map) {
    // const selectedTemplateFolder = this.localRepo + '/' + map.dir;

    let files = dir
      .files(this.localRepoTemplate, {
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
            .replace(this.localRepoTemplate + '/', '')
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
