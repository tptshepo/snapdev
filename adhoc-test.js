const { yargs } = require('./bin/command');

const command = 'clean';

(async () => {

  const output = await new Promise((resolve) => {
    yargs.parse(command.split(' '), (error, argv, output) => {
      resolve(output);
    });
  });
})();

