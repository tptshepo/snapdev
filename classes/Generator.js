const colors = require('colors');
const fs = require('fs');
const TemplateManager = require('./templateManager');
const mustache = require('mustache');
const { writeToFile } = require('./Utils');
const ModelManager = require('./modelManager');
const path = require('path');
const transformer = require('./transformer');

class Generator {
  constructor(srcFolder, modelFile, distFolder, verbose, silent) {
    this.srcFolder = srcFolder;
    this.modelFile = modelFile;
    this.distFolder = distFolder;
    this.verbose = verbose;
    this.silent = silent;
  }

  generate() {
    // Get template file list
    const templateManager = new TemplateManager(this.srcFolder);
    const template = templateManager.get();

    // Get model
    let modelData = {};
    const modelManager = new ModelManager();
    modelData = modelManager.getData(this.modelFile);

    /**================================================================ */
    // inject additional fields into the model
    /**================================================================ */
    modelData = transformer.injectStringHelpers(modelData);

    if (this.verbose) {
      console.log('==========', 'Data Model', '==========');
      console.log(modelData);
    }
    /**================================================================ */

    if (template.files.length > 0)
      console.log('==========', 'Source Code', '==========');

    // loop through the files in the template
    template.files.forEach((file) => {
      // original content
      if (this.verbose) {
        console.log(colors.yellow('Parse File'));
      }
      let oldContent = fs.readFileSync(file.src, 'utf8');
      if (this.verbose) {
        console.log(file.src);
      }

      // new content
      if (this.verbose) {
        console.log(colors.yellow('Old Content'));
        console.log(oldContent);
        console.log(colors.yellow('New Content'));
      }
      let newContent = mustache.render(oldContent, modelData);
      if (this.verbose) {
        console.log(newContent);
      }

      // get the output filename
      if (this.verbose) {
        console.log(colors.yellow('Output File'));
      }
      let outputFile = mustache.render(file.dist, modelData);

      //output the new file names
      const outputFilename = path.join(this.distFolder, outputFile);
      if (this.verbose) {
        console.log('Output filename:', outputFilename);
      }
      writeToFile(outputFilename, newContent, (error, results) => {
        if (error) {
          console.log(colors.red(error));
          process.exit(1);
        }
      });

      // console.log(outputFile);
      console.log(colors.green('Created:'), outputFile);
    });

    if (!this.silent) {
      console.log();
      console.log('Generate Done.');
    }
  }
}

module.exports = Generator;
