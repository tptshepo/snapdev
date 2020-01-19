const path = require('path');
const fs = require('fs-extra');
const spawn = require('spawn-command');

const cwd = path.join(process.cwd(), 'cwd');

const setup = async () => {
  await fs.remove(cwd);
  await fs.mkdir(cwd);
};

const cli = (args = '') => {
  // console.log(cwd);
  return new Promise((resolve, reject) => {
    let stdout = '';
    let stderr = '';
    const command = `snapdev ${args}`;
    const child = spawn(command, { cwd });

    child.on('error', error => {
      reject(error);
    });

    child.stdout.on('data', data => {
      stdout += data.toString();
    });

    child.stderr.on('data', data => {
      stderr += data.toString();
    });

    child.on('close', () => {
      if (stderr) {
        reject(stderr);
      } else {
        resolve(stdout);
      }
    });
  });
};

module.exports = {
  cwd,
  setup,
  cli
};
