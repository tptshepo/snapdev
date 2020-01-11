process.env.SUPPRESS_NO_CONFIG_WARNING = 'y';
process.env['NODE_CONFIG_DIR'] = __dirname + '/../config/';
const path = require('path');

// console.log(process.cwd());
// console.log(path.basename(process.cwd()));

// const semver = require('semver');

// console.log(semver.valid('1.2.3')); // '1.2.3'
// console.log(semver.valid('a.b.c')); // null
// console.log(semver.valid('v4')); // null

// const inquirer = require('inquirer');
// inquirer
//   .prompt([
//     {
//       name: 'username',
//       message: 'username:'
//     },
//     {
//       name: 'password',
//       message: 'password:',
//       type: 'password'
//     }
//   ])
//   .then(answers => {
//     console.log(answers);
//   });

// const homePath = require('home-path');

// console.log(path.join(homePath(), '.snapdev', 'credentials'));

const request = require('superagent');
const colors = require('colors');
const config = require('config');

const usersAPI = config.snapdevHost + config.usersAPI;
const templatesAPI = config.snapdevHost + config.templatesAPI;

(async () => {
  try {
    const response = await request.post(usersAPI + '/login').send({
      username: 'tptshepo',
      password: 'Tsh3p1@@'
    });

    console.log(response.body);
  } catch (err) {
    console.log(colors.yellow(err.status, err.message));
  }
})();
