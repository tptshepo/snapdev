#!/usr/bin/env node

const clear = require('clear');
const program = require('commander');
const colors = require('colors');
const fs = require('fs');
const path = require('path');
const packages = require('./models/index').models();
const dir = require('node-dir');
const mustache = require('mustache');
const helpers = require('./helpers');
const S = require('underscore.string');

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
const snapPackages = packages.filter(m => {
  return m.name === packageName;
});
let snapPackage;

if (snapPackages.length === 0) {
  console.log(colors.red('snapdev package not found: ' + packageName));
  process.exit();
} else {
  snapPackage = snapPackages[0];
  console.log(colors.green('snapdev Package: ' + snapPackage.name));
}

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

const baseDir = __dirname + '/templates/' + snapPackage.dir;
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
  modelData.underscoreucase = S(name)
    .underscored()
    .value()
    .toUpperCase();
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
  modelData.runderscoreucase = S(name)
    .underscored()
    .value()
    .toUpperCase();
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
    modelData.punderscoreucase = S(plural)
      .underscored()
      .value()
      .toUpperCase();
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
        modelData[propertiesFileName][index].lcase = name.toLowerCase();
        modelData[propertiesFileName][index].ucase = name.toUpperCase();
        modelData[propertiesFileName][index].underscorelcase = S(name)
          .underscored()
          .value();
        modelData[propertiesFileName][index].underscoreucase = S(name)
          .underscored()
          .value()
          .toUpperCase();
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

dir.readFiles(
  baseDir,
  function(error, content, filename, next) {
    if (error) {
      console.log(colors.red(error));
      process.exit();
    }

    // get just the filename without path
    let fname = path.basename(filename);
    // exlude some files
    if (fname === '.DS_Store') {
      next();
      return;
    }

    // Match the file found on disk to the file on the package configuration (models/index.js)
    let fnameOut = snapPackage.files.filter(file => {
      return path.join(baseDir, file.src) === filename;
      // return file.src === fname;
    });
    if (fnameOut.length == 0) {
      console.log(
        colors.yellow(filename + ' not found in snapdev package configuration')
      );
      next();
      return;
    }

    // parse the template
    let newContent = mustache.render(content, modelData);

    // prepare out filename
    let fout = fnameOut[0];
    let fdist = mustache.render(fout.dist, modelData);

    //output the new file names
    helpers.writeToFile(
      distFolder + '/' + fdist,
      newContent,
      (error, results) => {
        if (error) {
          console.log(colors.red(error));
          process.exit();
        }
      }
    );

    console.log(fdist);

    next();
  },
  function(error, files) {
    if (error) {
      console.log(colors.red(error));
      process.exit();
    }
    console.log(colors.yellow('Done!'));
  }
);
