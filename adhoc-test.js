// const { yargs } = require('./bin/command');

// const command = 'clean';

// (async () => {

//   const output = await new Promise((resolve) => {
//     yargs.parse(command.split(' '), (error, argv, output) => {
//       resolve(output);
//     });
//   });
// })();

// const semver = require('semver');

const semverInc = require('semver/functions/inc');

console.log( semverInc('0.0.1', 'patch') );
