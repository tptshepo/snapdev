#!/usr/bin/env node

// const program = require('commander');
const Generator = require('../classes/Generator');
const TemplateManager = require('../classes/TemplateManager');
const pjson = require('../package.json');
const yargs = require('yargs');
const CLI = require('../classes/CLI');
const colors = require('colors');

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

// checkout

yargs.command({
  command: 'checkout <template>',
  aliases: ['co'],
  describe: 'Switch context to the specified template',
  builder: {
    create: {
      describe: 'Indicates whether the template should be created if not found',
      demandOption: false,
      type: 'boolean',
      alias: 'c'
    }
  },
  handler: function(program) {
    (async () => {
      try {
        const cli = new CLI(program, pjson.version);
        const ok = await cli.checkout();
        if (!ok) {
          yargs.showHelp();
        }
      } catch (err) {
        console.log(colors.yellow('checkout failed.'));
      }
    })();
  }
});

// add

yargs.command({
  command: 'add <model>',
  aliases: ['a'],
  describe: 'Add a model file',
  handler: function(program) {
    (async () => {
      try {
        const cli = new CLI(program, pjson.version);
        const ok = await cli.add();
        if (!ok) {
          yargs.showHelp();
        }
      } catch (err) {
        console.log(colors.yellow('Add failed.'));
      }
    })();
  }
});

// generate

yargs.command({
  command: 'generate [model]',
  aliases: ['g'],
  describe: 'Generate source code based on a given template and model',
  builder: {
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
    (async () => {
      try {
        const cli = new CLI(program, pjson.version);
        const ok = await cli.generate();
        if (!ok) {
          yargs.showHelp();
        }
      } catch (err) {
        console.log(colors.yellow('Generate failed.'));
      }
    })();
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
