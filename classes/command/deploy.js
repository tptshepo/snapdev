const BaseCommand = require('./baseCommand');
const path = require('path');
const colors = require('colors');
const fs = require('fs-extra');
const klawSync = require('klaw-sync');
const readline = require('readline');
const { once } = require('events');
const insertLine = require('insert-line');

module.exports = class Command extends BaseCommand {
  constructor(cli) {
    super(cli);
  }
  async execute() {
    let parentProjectFolder = path.join(this.cli.currentLocation, '../');

    if (!this.cli.program.force) {
      if (
        fs.existsSync(path.join(parentProjectFolder, '.no-snapdev-project'))
      ) {
        console.log(
          colors.yellow('Project folder conatins .no-snapdev-project file')
        );
        process.exit(1);
      }
    }

    let srcFolder = this.cli.distFolder;
    let distFolder = parentProjectFolder;

    if (!this.cli.program.silent) {
      console.log('Destination:', distFolder);
    }

    const filterCopyFiles = async (src, dist) => {
      if (src !== this.cli.distFolder) {
        const fileFound = await fs.pathExists(dist);
        if (!fileFound || this.cli.program.force) {
          console.log(
            colors.green('Copied:'),
            src.replace(path.join(this.cli.distFolder, '/'), '')
          );
        }
      } else {
        // console.log(
        //   colors.yellow(src, '*********', this.cli.distFolder)
        // );
      }
      return true;
    };

    // copy the files but don't override
    await fs.copy(srcFolder, distFolder, {
      overwrite: this.cli.program.force,
      filter: filterCopyFiles,
    });

    /**
     * ========================
     * Build a copy list
     * ========================
     */
    // get a list of all files
    let paths = klawSync(srcFolder, {
      nodir: true,
    });
    let generatedFiles = paths.map((p) => p.path);
    const copyList = await this.getCopyPlaceholderList(generatedFiles);
    // console.log(copyList);

    /**
     * ========================
     * Build a paste list
     * ========================
     */
    const filterDistFn = (item) => {
      //ignore hidden directories
      const basename = path.basename(item.path);
      const notHidden = basename === '.' || basename[0] !== '.';
      if (notHidden) {
        const relativeFile = item.path.replace(distFolder, '');
        if (
          !(
            relativeFile === 'snapdev' ||
            relativeFile.startsWith('snapdev/') ||
            relativeFile === 'node_modules' ||
            relativeFile.startsWith('node_modules/')
          )
        ) {
          // console.log(item.path);
          return true;
        }
      }
      return false;
    };
    paths = klawSync(distFolder, {
      nodir: true,
      filter: filterDistFn,
    });
    let projectFiles = paths.map((p) => p.path);
    let pasteList = await this.getPastePlaceholderList(
      projectFiles,
      distFolder
    );
    // console.log(pasteList);

    /**
     * ========================
     * Inject code where a matching paste command is found
     * ========================
     */
    // console.log('***********', pasteList);
    const pasted = [];

    for (let index = 0; index < pasteList.length; index++) {
      const pasteItem = pasteList[index];

      const hasPasted =
        pasted.filter(
          (i) =>
            i.dist === pasteItem.dist &&
            i.index === pasteItem.index &&
            i.marker === pasteItem.marker
        ).length > 0;
      if (hasPasted) {
        // skip
        continue;
      }

      for (let index2 = 0; index2 < copyList.length; index2++) {
        const copyItem = copyList[index2];
        if (
          copyItem.dist === pasteItem.dist &&
          copyItem.marker === pasteItem.marker
        ) {
          // inject the copy code into the pastItem dist file
          const distFile = path.join(distFolder, pasteItem.dist);
          await this.injectCodeIntoFile(
            distFile,
            pasteItem.lineNo,
            copyItem.code
          );
          console.log(colors.green('Updated:'), pasteItem.dist);
          pasted.push(pasteItem);

          // reset paste line numbers
          pasteList = await this.getPastePlaceholderList(
            projectFiles,
            distFolder
          );
          index = 0; // reset loop 1
          break; // exit loop 2
        }
      }
    }

    if (!this.cli.program.silent) {
      console.log('');
      console.log('Deploy Done.');
    }

    return true;
  }

  injectCodeIntoFile(file, insertLineNo, codeList) {
    return new Promise((resolve) => {
      insertLine(file)
        .content(codeList.join('\n'))
        .at(insertLineNo)
        .then(function (err) {
          if (err) {
            console.log(colors.yellow(`snapdev::paste failed`), err);
            process.exit(1);
          }
          resolve();
        });
    });
  }

  removeComments(line) {
    return line.replace('<!-- ', '').replace(' -->', '').replace('# //', '//');
  }

  // snapdev::copy-start::{"marker": "route", "dist": "src/app/app.routing.ts"}
  // snapdev:copy-end
  async getCopyPlaceholderList(files) {
    let output = [];
    /**
     * structure
     * {
     *  marker: "", dist: "", code: ""
     * }
     */

    async function processLine(file, removeComments) {
      const fileStream = fs.createReadStream(file);
      const results = [];
      let marker = '';
      let dist = '';
      let code = [];
      let copyLine = false;
      const rl = readline.createInterface({
        input: fileStream,
        crlfDelay: Infinity,
      });
      rl.on('line', (line) => {
        // Process the line.
        if (line.indexOf('// snapdev::copy-end') > -1) {
          // end copy
          copyLine = false;
          results.push({
            marker,
            dist,
            code,
          });
          marker = '';
          dist = '';
          code = [];
        }
        if (copyLine) {
          code.push(line);
        }
        if (line.indexOf('// snapdev::copy-start') > -1) {
          // start copy
          copyLine = true;
          // snapdev::command::parameters
          const commandSplit = removeComments(line).split('::');
          let jsonParams;
          try {
            jsonParams = JSON.parse(commandSplit[2]);
          } catch (error) {
            console.log(
              colors.yellow(`Invalid JSON for snapdev::copy-start, ${file}`)
            );
            process.exit(1);
          }
          if (jsonParams.marker === undefined) {
            console.log(
              colors.yellow(`snapdev::copy-start missing marker key, ${file}`)
            );
            process.exit(1);
          }
          if (jsonParams.dist === undefined) {
            console.log(
              colors.yellow(`snapdev::copy-start missing dist key, ${file}`)
            );
            process.exit(1);
          }
          // command is valid
          marker = jsonParams.marker;
          dist = jsonParams.dist;
        }
      });
      await once(rl, 'close');
      if (copyLine) {
        console.log(colors.yellow(`snapdev::copy-end not found, ${file}`));
        process.exit(1);
      }
      return results;
    }

    for (let index = 0; index < files.length; index++) {
      const file = files[index];
      if (this.cli.program.verbose) {
        console.log('Copy Scan:', file);
      }
      const results = await processLine(file, this.removeComments);
      // console.log(results);
      output = output.concat(results);
    }

    return output;
  }

  // snapdev::paste::{"marker": "route", "index": 0}
  async getPastePlaceholderList(files, distFolder) {
    let output = [];
    /**
     * structure
     * {
     *  marker: '',
     *  index: 0,
     *  lineNo: 0,
     *  dist: ''
     * }
     */

    async function processLine(file, removeComments) {
      const fileStream = fs.createReadStream(file);
      const results = [];
      let marker = '';
      let lineNo = 0;
      let index = 0;
      const relativeFile = file.replace(distFolder, '');
      const rl = readline.createInterface({
        input: fileStream,
        crlfDelay: Infinity,
      });
      rl.on('line', (line) => {
        // Process the line.
        lineNo++;
        if (line.indexOf('// snapdev::paste') > -1) {
          // snapdev::command::parameters
          const commandSplit = removeComments(line).split('::');
          let jsonParams;
          try {
            jsonParams = JSON.parse(commandSplit[2]);
          } catch (error) {
            console.log(
              colors.yellow(`Invalid JSON for snapdev::paste, ${file}`)
            );
            process.exit(1);
          }
          if (jsonParams.marker === undefined) {
            console.log(
              colors.yellow(`snapdev::paste missing marker key, ${file}`)
            );
            process.exit(1);
          }
          if (jsonParams.index !== undefined) {
            index = jsonParams.index;
          }
          // command is valid
          marker = jsonParams.marker;
          results.push({
            marker,
            lineNo: lineNo,
            index,
            dist: relativeFile,
          });
          marker = '';
        }
      });
      await once(rl, 'close');
      return results;
    }

    for (let index = 0; index < files.length; index++) {
      const file = files[index];
      if (this.cli.program.verbose) {
        console.log('Paste Scan:', file);
      }
      const results = await processLine(file, this.removeComments);
      // console.log(results);
      output = output.concat(results);
    }

    return output;
  }
};
