#!/usr/bin/env node

const program = require('commander');
const Generator = require('../classes/Generator');
const TemplateManager = require('../classes/TemplateManager');

program
  .version('1.3.0')
  .usage('-t <template name> -m <model.json>')
  .option('-t, --template <template name>', 'Specify the template name')
  .option('-m, --model <model.json>', 'Specify the data model')
  .option('-v, --verbose', 'Show additional logs')
  .option('-c, --clear', 'Clear the destination folder')
  .option('-o, --output', 'Output the full data model')
  .option('-p, --pull <template name>', 'Pull template from repository')
  .parse(process.argv);

if (program.pull) {
  const templateManager = new TemplateManager(program.pull);
  templateManager.pull();
  process.exit();
}

const generator = new Generator(program);
generator.generate();
