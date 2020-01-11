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

const homePath = require('home-path');

console.log(path.join(homePath(), '.snapdev', 'credentials'));
