#!/usr/bin/env node

// const program = require('commander');
const Generator = require('../classes/Generator');
const TemplateManager = require('../classes/TemplateManager');
const pjson = require('../package.json');
const yargs = require('yargs');
const CLI = require('../classes/CLI');

yargs.version(pjson.version);

// init
yargs.command({
  command: 'init',
  aliases: ['i'],
  describe: 'Initialize snapdev in the current location',
  handler: function() {
    const cli = new CLI(null, pjson.version);
    cli.init();
  }
});

// create

yargs.command({
  command: 'create',
  aliases: ['c'],
  describe: 'Create supporting files',
  builder: {
    template: {
      describe:
        'Create a new template with the specified name. The name can either be <username>/<template-name> or <template-name>. If you plan to push the template to the online repo, it will have to be tagged with the <username>. See the snapdev tag --help for more details',
      demandOption: false,
      type: 'string',
      alias: 't'
    },
    model: {
      describe:
        'Add a new model file that ends with a .json extension. The file is created relative to the models folder. To put the file in a sub-folder simply specify "folder/folder/model.json"',
      demandOption: false,
      type: 'string',
      alias: 'm'
    }
  },
  handler: function(program) {
    const cli = new CLI(program, pjson.version);
    const ok = cli.create();
    if (!ok) {
      yargs.showHelp();
    }
  }
});

// generate

yargs.command({
  command: 'generate',
  aliases: ['g'],
  describe: 'Generate source code based on a given template and model',
  builder: {
    template: {
      describe: 'The name of a template',
      demandOption: true,
      type: 'string',
      alias: 't'
    },
    model: {
      describe: 'The name of a model',
      demandOption: false,
      type: 'string',
      alias: 'm',
      default: ''
    },
    clear: {
      describe: 'Clear the destination folder before generating code',
      demandOption: false,
      type: 'boolean',
      alias: 'c'
    },
    verbose: {
      describe: 'Show additional details',
      demandOption: false,
      type: 'boolean',
      alias: 'v'
    }
  },
  handler: function(program) {
    const cli = new CLI(program, pjson.version);
    const ok = cli.generate();
    if (!ok) {
      yargs.showHelp();
    }
  }
});

yargs.strict().help();

yargs.parse();

// if (program.pull) {
//   const templateManager = new TemplateManager(program.pull);
//   templateManager.pull();
//   process.exit();
// }

// const generator = new Generator(program);
// generator.generate();
