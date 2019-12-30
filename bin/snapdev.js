#!/usr/bin/env node

const program = require('commander');
const Generator = require('../classes/Generator');

program
  .version('1.1.0')
  .usage('-t <template> -m <model>')
  .option('-t, --template <name>', 'Specify the template name')
  .option('-m, --model <filename>', 'Specify the data model')
  .option('-v, --verbose', 'Show additional logs')
  .option('-c, --clear', 'Clear the destination folder')
  .option('-o, --output', 'Output the full data model')
  .parse(process.argv);

const generator = new Generator(program);
generator.generate();
