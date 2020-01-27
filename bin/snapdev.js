#!/usr/bin/env node
process.env.SUPPRESS_NO_CONFIG_WARNING = 'y';
process.env['NODE_CONFIG_DIR'] = __dirname + '/../config/';

const pjson = require('../package.json');
const yargs = require('yargs');
const CLI = require('../classes/cli');
const colors = require('colors');
const inquirer = require('inquirer');

yargs.version(pjson.version);

// init

yargs.command({
  command: 'init [project]',
  aliases: ['i', 'n', 'new'],
  describe: 'Initialize snapdev',
  handler: function(program) {
    (async () => {
      try {
        const cli = new CLI(program, pjson.version);
        const ok = cli.init();
        if (!ok) {
          yargs.showHelp();
        }
      } catch (err) {
        console.log(colors.yellow('Init failed.', err.message));
      }
    })();
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

// clean

yargs.command({
  command: 'clean',
  // aliases: ['g'],
  describe: 'Cleans the dist folder of generated files',
  builder: {
    force: {
      describe: 'Remove everything in the dist folder',
      demandOption: false,
      type: 'boolean',
      alias: 'f',
      default: false
    }
  },
  handler: function(program) {
    (async () => {
      try {
        const cli = new CLI(program, pjson.version);
        const ok = await cli.clean();
        if (!ok) {
          yargs.showHelp();
        }
      } catch (err) {
        console.log(colors.yellow('Clean failed.', err.message));
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
    clear: {
      describe: 'Clear the destination folder before generating code',
      demandOption: false,
      type: 'boolean',
      alias: 'c',
      default: true
    },
    force: {
      describe: 'Remove everything in the dist folder',
      demandOption: false,
      type: 'boolean',
      alias: 'f',
      default: false
    },
    verbose: {
      describe: 'Show additional details',
      demandOption: false,
      type: 'boolean',
      alias: 'v'
    },
    all: {
      describe: 'Render for all model files',
      demandOption: false,
      type: 'boolean',
      alias: 'a',
      default: true
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
  // aliases: ['l'],
  describe: 'Log in to snapdev online repository',
  builder: {
    username: {
      describe: 'Username',
      demandOption: false,
      type: 'string',
      alias: 'u'
    },
    password: {
      describe: 'Password',
      demandOption: false,
      type: 'string',
      alias: 'p'
    }
  },
  handler: function(program) {
    (async () => {
      try {
        const cli = new CLI(program, pjson.version);
        let ok;
        const loggedIn = await cli.isLoggedIn();
        if (loggedIn) {
          ok = await cli.relogin();
        } else {
          if (program.username && program.password) {
            // direct login
          } else {
            await cli.inputLogin();
          }
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
  // aliases: ['o'],
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

// create

yargs.command({
  command: 'create <template>',
  // aliases: ['c'],
  describe: 'Create a new template',
  handler: function(program) {
    (async () => {
      try {
        const cli = new CLI(program, pjson.version);
        const ok = await cli.create();
        if (!ok) {
          yargs.showHelp();
        }
      } catch (err) {
        console.log(colors.yellow('Create failed.', err.message));
      }
    })();
  }
});

// checkout

yargs.command({
  command: 'checkout <template>',
  // aliases: ['c'],
  describe: 'Switch context to the specified template',
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
  aliases: ['pull'],
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

// deploy
yargs.command({
  command: 'deploy',
  aliases: ['d'],
  describe: 'Copy the generated code to the snapdev parent folder',
  builder: {
    force: {
      describe: 'Override any files found in the destination folder',
      demandOption: false,
      type: 'boolean',
      default: false
      // alias: 'f'
    },
    all: {
      describe: 'Render for all model files',
      demandOption: false,
      type: 'boolean',
      alias: 'a',
      default: true
    }
  },
  handler: function(program) {
    (async () => {
      try {
        const cli = new CLI(program, pjson.version);
        const ok = await cli.deploy();
        if (!ok) {
          yargs.showHelp();
        }
      } catch (err) {
        console.log(colors.yellow('Deploy failed.', err.message));
      }
    })();
  }
});

// reset

yargs.command({
  command: 'reset',
  // aliases: ['s'],
  describe:
    'Revert the current template to the latest version on the online repository',
  handler: function(program) {
    (async () => {
      try {
        const cli = new CLI(program, pjson.version);
        const ok = await cli.reset();
        if (!ok) {
          yargs.showHelp();
        }
      } catch (err) {
        console.log(colors.yellow('Reset failed.', err.message));
      }
    })();
  }
});

// delete
yargs.command({
  command: 'delete <template>',
  // aliases: ['d'],
  describe: 'Delete a template from your local repository',
  builder: {
    remote: {
      describe: 'Delete the template from the online repository as well',
      demandOption: false,
      type: 'boolean',
      default: false
      // alias: 'f'
    }
  },
  handler: function(program) {
    (async () => {
      try {
        const cli = new CLI(program, pjson.version);
        const ok = await cli.delete();
        if (!ok) {
          yargs.showHelp();
        }
      } catch (err) {
        console.log(colors.yellow('Deploy failed.', err.message));
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
