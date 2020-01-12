#!/usr/bin/env node
process.env.SUPPRESS_NO_CONFIG_WARNING = 'y';
process.env['NODE_CONFIG_DIR'] = __dirname + '/../config/';

const pjson = require('../package.json');
const yargs = require('yargs');
const CLI = require('../classes/CLI');
const colors = require('colors');
const inquirer = require('inquirer');

yargs.version(pjson.version);

// init
yargs.command({
  command: 'init',
  aliases: ['i'],
  describe: 'Initialize snapdev',
  handler: function() {
    const cli = new CLI(null, pjson.version);
    cli.init();
  }
});

// status
yargs.command({
  command: 'status',
  aliases: ['s'],
  describe: 'Get status of the current context',
  handler: function(program) {
    (async () => {
      try {
        const cli = new CLI(program, pjson.version);
        const ok = await cli.status();
        if (!ok) {
          yargs.showHelp();
        }
      } catch (err) {
        console.log(colors.yellow('Status failed.', err.message));
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
        console.log(colors.yellow('Add failed.', err.message));
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
        console.log(colors.yellow('Generate failed.', err.message));
      }
    })();
  }
});

// register
yargs.command({
  command: 'register',
  aliases: ['r'],
  describe: 'Register for a free snapdev account',
  handler: function(program) {
    (async () => {
      try {
        const cli = new CLI(program, pjson.version);
        let ok;
        console.log(
          'Register for a free snapdev account to push and clone templates.'
        );
        const input = await inquirer.prompt([
          {
            name: 'email',
            message: 'Email:',
            validate: function validateFirstName(value) {
              return value !== '';
            }
          },
          {
            name: 'username',
            message: 'Username:',
            validate: function validateFirstName(value) {
              return value !== '';
            }
          },
          {
            name: 'password',
            message: 'Password:',
            type: 'password',
            validate: function validateFirstName(value) {
              return value !== '';
            }
          },
          {
            name: 'password2',
            message: 'Password again:',
            type: 'password',
            validate: function validateFirstName(value) {
              return value !== '';
            }
          }
        ]);

        cli.program.email = input.email;
        cli.program.username = input.username;
        cli.program.password = input.password;
        cli.program.password2 = input.password2;

        ok = await cli.register();

        if (!ok) {
          yargs.showHelp();
        }
      } catch (err) {
        console.log(colors.yellow('Registration failed.', err.message));
      }
    })();
  }
});

// login
yargs.command({
  command: 'login',
  aliases: ['l'],
  describe: 'Log in to snapdev online repository',
  handler: function(program) {
    (async () => {
      try {
        const cli = new CLI(program, pjson.version);
        let ok;
        const loggedIn = await cli.isLoggedIn();
        if (loggedIn) {
          ok = await cli.relogin();
        } else {
          console.log(
            'Login with your snapdev username to push and clone templates from snapdev online repository.'
          );
          const input = await inquirer.prompt([
            {
              name: 'username',
              message: 'Username:',
              validate: function validateFirstName(value) {
                return value !== '';
              }
            },
            {
              name: 'password',
              message: 'Password:',
              type: 'password',
              validate: function validateFirstName(value) {
                return value !== '';
              }
            }
          ]);

          cli.program.username = input.username;
          cli.program.password = input.password;
          ok = await cli.login();
        }
        if (!ok) {
          yargs.showHelp();
        }
      } catch (err) {
        console.log(colors.yellow('Login failed.', err.message));
      }
    })();
  }
});

// logout
yargs.command({
  command: 'logout',
  aliases: ['o'],
  describe: 'Log out from snapdev online repository',
  builder: {
    force: {
      describe: 'Remove local credentials',
      demandOption: false,
      type: 'boolean'
      // alias:
    }
  },
  handler: function(program) {
    (async () => {
      try {
        const cli = new CLI(program, pjson.version);
        const ok = await cli.logout();
        if (!ok) {
          yargs.showHelp();
        }
      } catch (err) {
        console.log(colors.yellow('Logout failed.', err.message));
      }
    })();
  }
});

// list
yargs.command({
  command: 'list',
  aliases: ['ls'],
  describe: 'List all your templates on snapdev online repository.',
  handler: function(program) {
    (async () => {
      try {
        const cli = new CLI(program, pjson.version);
        const ok = await cli.list();
        if (!ok) {
          yargs.showHelp();
        }
      } catch (err) {
        console.log(colors.yellow('List failed.', err.message));
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
    user: {
      describe: 'Rename the template',
      demandOption: false,
      type: 'boolean',
      alias: 'u'
    },
    name: {
      describe: 'Rename the template',
      demandOption: false,
      type: 'string',
      alias: 'n'
    },
    version: {
      describe:
        'Set the version number for the template using the https://semver.org/ specification.',
      demandOption: false,
      type: 'string',
      alias: 'v'
    },
    private: {
      describe: 'Mark template as private',
      demandOption: false,
      type: 'boolean'
      // alias: 'u'
    },
    public: {
      describe: 'Mark template as public',
      demandOption: false,
      type: 'boolean'
      // alias: 'u'
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
        console.log(colors.yellow('Tag failed.', err.message));
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
        console.log(colors.yellow('Checkout failed.', err.message));
      }
    })();
  }
});

// clone

yargs.command({
  command: 'clone <template>',
  // aliases: ['c'],
  describe: 'Pull a template from the snapdev online repository',
  builder: {
    force: {
      describe: 'Override the local template folder',
      demandOption: false,
      type: 'boolean'
      // alias: 'f'
    }
  },
  handler: function(program) {
    (async () => {
      try {
        const cli = new CLI(program, pjson.version);
        const ok = await cli.clone();
        if (!ok) {
          yargs.showHelp();
        }
      } catch (err) {
        console.log(colors.yellow('Clone failed.', err.message));
      }
    })();
  }
});

// push
yargs.command({
  command: 'push',
  aliases: ['p'],
  describe: 'Upload a template to snapdev online repository.',
  handler: function(program) {
    (async () => {
      try {
        const cli = new CLI(program, pjson.version);
        const ok = await cli.push();
        if (!ok) {
          yargs.showHelp();
        }
      } catch (err) {
        console.log(colors.yellow('Push failed.', err.message));
      }
    })();
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

yargs
  .strict()
  .version(false)
  .help();

yargs.parse();
