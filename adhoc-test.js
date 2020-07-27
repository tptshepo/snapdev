const { yargs } = require('./bin/command');

// process.chdir(cwd);


const command = 'status';


(async () => {

  const output = await new Promise((resolve) => {
    yargs.parse(command.split(' '), (error, argv, output) => {
      resolve(output);
    });
  });

  console.warn(output);

})();

