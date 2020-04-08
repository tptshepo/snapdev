const colors = require('colors');
const fs = require('fs');
const TemplateManager = require('./templateManager');
const mustache = require('mustache');
const helpers = require('../helpers');
const S = require('underscore.string');
const _ = require('lodash');
const ModelManager = require('./modelManager');
const path = require('path');
const transformer = require('./transformer');

class Generator {
  constructor(srcFolder, modelFile, distFolder, verbose) {
    this.srcFolder = srcFolder;
    this.modelFile = modelFile;
    this.distFolder = distFolder;
    this.verbose = verbose;
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
    let name = '';
    if (modelData['name']) {
      name = modelData['name'];
    } else if (modelData['class']) {
      name = modelData['class'];
    } else if (modelData['model']) {
      name = modelData['model'];
    }

    modelData = transformer.injectStringHelpers(modelData);

    if (this.verbose) {
      console.log('==========', 'Data Model', '==========');
      console.log(modelData);
    }
    /**================================================================ */

    if (template.files.length > 0)
      console.log('==========', 'Source Code', '==========');

    // loop through the files in the template
    template.files.forEach(file => {
      // console.log(file);
      // original content
      let content = fs.readFileSync(file.src, 'utf8');

      // new content
      let newContent = mustache.render(content, modelData);

      // get the output filename
      let outputFile = mustache.render(file.dist, modelData);

      //output the new file names
      helpers.writeToFile(
        path.join(this.distFolder, outputFile),
        newContent,
        (error, results) => {
          if (error) {
            console.log(colors.red(error));
            process.exit(1);
          }
        }
      );

      console.log(outputFile);
    });
  }
}

module.exports = Generator;
