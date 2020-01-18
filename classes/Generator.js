const colors = require('colors');
const fs = require('fs');
const TemplateManager = require('./TemplateManager');
const mustache = require('mustache');
const helpers = require('../helpers');
const S = require('underscore.string');
const _ = require('lodash');
const ModelManager = require('./ModelManager');
const path = require('path');

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

    // if (name === '') {
    //   console.log(colors.red('Root property required for name|class|model'));
    //   process.exit(1);
    // }

    let plural = '' + modelData['plural'];
    if (plural === 'undefined' || plural === '') {
      plural = '';
      // console.log(colors.red('Root property required for plural'));
      // process.exit(1);
    }

    modelData.camelcase = S(name)
      .camelize(true)
      .value();
    modelData.lcase = name.toLowerCase();
    modelData.ucase = name.toUpperCase();
    modelData.underscorelcase = S(name)
      .underscored()
      .value();
    modelData.dashlcase = _.replace(modelData.underscorelcase, '_', '-');
    modelData.underscoreucase = S(name)
      .underscored()
      .value()
      .toUpperCase();
    modelData.dashucase = _.replace(modelData.underscoreucase, '_', '-');
    modelData.titlecase = S(name)
      .classify()
      .value();
    //root
    modelData.rcamelcase = S(name)
      .camelize(true)
      .value();
    modelData.rlcase = name.toLowerCase();
    modelData.rucase = name.toUpperCase();
    modelData.runderscorelcase = S(name)
      .underscored()
      .value();
    modelData.rdashlcase = _.replace(modelData.runderscorelcase, '_', '-');
    modelData.runderscoreucase = S(name)
      .underscored()
      .value()
      .toUpperCase();
    modelData.rdashucase = _.replace(modelData.runderscoreucase, '_', '-');
    modelData.rtitlecase = S(name)
      .classify()
      .value();

    //plural
    if (plural) {
      modelData.pcamelcase = S(plural)
        .camelize(true)
        .value();
      modelData.plcase = plural.toLowerCase();
      modelData.pucase = plural.toUpperCase();
      modelData.punderscorelcase = S(plural)
        .underscored()
        .value();
      modelData.pdashlcase = _.replace(modelData.punderscorelcase, '_', '-');
      modelData.punderscoreucase = S(plural)
        .underscored()
        .value()
        .toUpperCase();
      modelData.pdashucase = _.replace(modelData.punderscoreucase, '_', '-');
      modelData.ptitlecase = S(plural)
        .classify()
        .value();
    }

    // console.log(modelData);
    let propertiesFileName = 'properties';
    if (modelData[propertiesFileName]) {
      if (modelData[propertiesFileName].length > 0) {
        let lastIndex = modelData[propertiesFileName].length - 1;
        modelData[propertiesFileName][lastIndex].last = true;

        // check for name property
        if (modelData[propertiesFileName][lastIndex]['name']) {
          let count = modelData[propertiesFileName].length;
          for (let index = 0; index < count; index++) {
            let name = modelData[propertiesFileName][index]['name'];
            modelData[propertiesFileName][index].camelcase = S(name)
              .camelize(true)
              .value();
            let plural = modelData[propertiesFileName][index]['plural'];
            if (plural) {
              modelData[propertiesFileName][index].pcamelcase = S(plural)
                .camelize(true)
                .value();
              modelData[propertiesFileName][
                index
              ].plcase = plural.toLowerCase();
              modelData[propertiesFileName][
                index
              ].pucase = plural.toUpperCase();
              modelData[propertiesFileName][index].punderscorelcase = S(plural)
                .underscored()
                .value();
              modelData[propertiesFileName][index].pdashlcase = _.replace(
                modelData.punderscorelcase,
                '_',
                '-'
              );
              modelData[propertiesFileName][index].punderscoreucase = S(plural)
                .underscored()
                .value()
                .toUpperCase();
              modelData[propertiesFileName][index].pdashucase = _.replace(
                modelData.punderscoreucase,
                '_',
                '-'
              );
              modelData[propertiesFileName][index].ptitlecase = S(plural)
                .classify()
                .value();
            }
            modelData[propertiesFileName][index].lcase = name.toLowerCase();
            modelData[propertiesFileName][index].ucase = name.toUpperCase();
            modelData[propertiesFileName][index].underscorelcase = S(name)
              .underscored()
              .value();
            modelData[propertiesFileName][index].dashlcase = _.replace(
              modelData[propertiesFileName][index].underscorelcase,
              '_',
              '-'
            );
            modelData[propertiesFileName][index].underscoreucase = S(name)
              .underscored()
              .value()
              .toUpperCase();
            modelData[propertiesFileName][index].dashucase = _.replace(
              modelData[propertiesFileName][index].underscoreucase,
              '_',
              '-'
            );
            modelData[propertiesFileName][index].titlecase = S(name)
              .classify()
              .value();
          }
        }
      }
    }

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
