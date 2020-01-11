#!/usr/bin/env node

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

// version
yargs.command({
  command: 'version',
  aliases: ['v'],
  describe: 'Snapdev version number',
  handler: function() {
    console.log('v' + pjson.version);
  }
});

// status
yargs.command({
  command: 'status',
  aliases: ['s'],
  describe: 'Get status of snapdev context',
  handler: function(program) {
    (async () => {
      try {
        const cli = new CLI(program, pjson.version);
        const ok = await cli.status();
        if (!ok) {
          yargs.showHelp();
        }
      } catch (err) {
        console.log(colors.yellow('Status failed.'));
      }
    })();
  }
});

// checkout

yargs.command({
  command: 'checkout <template>',
  aliases: ['c'],
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
        console.log(colors.yellow('Checkout failed.'));
      }
    })();
  }
});

// tag

yargs.command({
  command: 'tag',
  aliases: ['t'],
  describe: 'Change template configuration',
  builder: {
    version: {
      describe:
        'Set the version number for the template using the https://semver.org/ specification.',
      demandOption: false,
      type: 'string',
      alias: 'v'
    },
    username: {
      describe: 'Put the template inside a user folder.',
      demandOption: false,
      type: 'string',
      alias: 'u'
    }
  },
  handler: function(program) {
    (async () => {
      try {
        const cli = new CLI(program, pjson.version);
        const ok = await cli.tag();
        if (!ok) {
          yargs.showHelp();
        }
      } catch (err) {
        console.log(colors.yellow('Tag failed.'));
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

yargs
  .strict()
  .version(false)
  .help();

yargs.parse();
