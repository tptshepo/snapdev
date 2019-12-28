#!/usr/bin/env node

const clear = require('clear');
const program = require('commander');
const colors = require('colors');
const fs = require('fs');
const packageIndex = require('./models/index');
const mustache = require('mustache');
const helpers = require('./helpers');
const S = require('underscore.string');
const _ = require('lodash');

program
  .version('0.0.1')
  .usage('-p [package] -d [data model]')
  .option('-p, --package', 'Specify the package name')
  .option('-d, --data', 'Specify the data model')
  .option('-v, --verbose', 'Show additional logs')
  .option(
    '-c, --clear',
    'Clear the destination folder before generating new files'
  )
  .option('-o, --output', 'Output the data model used by the templates')
  .parse(process.argv);

const argv = require('minimist')(process.argv.slice(2));

if (!program.package) {
  console.log(colors.red('-p is required'));
  program.help();
  process.exit();
}

if (!program.data) {
  console.log(colors.red('-d is required'));
  program.help();
  process.exit();
}

let clearDist = false;
if (program.clear) {
  clearDist = true;
}

const packageName = argv.p ? argv.p : argv.package;
const distFolder = __dirname + '/dist';
const snapPackages = packageIndex.find(packageName);

let argData = {};
if (program.data) {
  // validate model
  const dataFile = __dirname + '/' + (argv.d ? argv.d : argv.data);
  // check if file exists
  if (fs.existsSync(dataFile)) {
    argData = JSON.parse(fs.readFileSync(dataFile, 'utf8'));
  } else {
    console.log(colors.red('data model file not found: ' + dataFile));
    program.help();
    process.exit();
  }
}

// const baseDir = __dirname + '/templates/' + snapPackage.dir;
//console.log("Location:" + baseDir);

// get JSON from default model
const defaultDataFileName = __dirname + '/models/default.json';
let defaultData = JSON.parse(fs.readFileSync(defaultDataFileName, 'utf8'));
// merge models
let modelData = Object.assign(defaultData, argData);

/**================================================================ */
// inject additional fields into the model
/**================================================================ */
if (modelData['name'] || modelData['class'] || modelData['model']) {
  let name = '';
  if (modelData['name']) name = modelData['name'];
  else if (modelData['class']) name = modelData['class'];
  else if (modelData['model']) name = modelData['model'];

  if (name === '') {
    console.log(colors.red('name|class|model is not set'));
    process.exit();
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
  let plural = modelData['plural'];
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
          modelData[propertiesFileName][index].plcase = plural.toLowerCase();
          modelData[propertiesFileName][index].pucase = plural.toUpperCase();
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
if (program.verbose) {
  console.log('=================');
  console.log('DATA MODEL');
  console.log('=================');
  console.log(modelData);
  console.log('=================');
}
/**================================================================ */

if (program.output) {
  let modelString = JSON.stringify(modelData);
  //console.log(colors.gray(modelString));
  helpers.writeToFile('model_out.json', modelString, (error, results) => {
    if (error) {
      console.log(colors.red('Model out error'));
    }
  });
}

// clean dist folder and create new files
if (clearDist) helpers.cleanDir(distFolder);

console.log(colors.yellow('Generating files...'));

// loop through the files in the package
snapPackages.files.forEach(file => {
  // console.log(file);
  // original content
  let content = fs.readFileSync(file.src, 'utf8');

  // new content
  let newContent = mustache.render(content, modelData);

  // get the output filename
  let outputFile = mustache.render(file.dist, modelData);

  //output the new file names
  helpers.writeToFile(
    distFolder + '/' + outputFile,
    newContent,
    (error, results) => {
      if (error) {
        console.log(colors.red(error));
        process.exit();
      }
    }
  );

  console.log(outputFile);
});
