const path = require('path');
const fs = require('fs-extra');
const spawn = require('spawn-command');

let cwd = path.join(process.cwd(), 'cwd');

let username = 'snapdevtest';
let password = '12345678';

let projectName = 'my-project-test';
let templateName = 'test-app';
let projectFolder = path.join(cwd, projectName);
let snapdevFolder = path.join(projectFolder, 'snapdev');
let snapdevDistFolder = path.join(snapdevFolder, 'dist');
let snapdevTemplateFolder = path.join(snapdevFolder, 'templates');
let snapdevJsonFile = path.join(snapdevFolder, 'snapdev.json');

let templateModelFolder = path.join(
  snapdevTemplateFolder,
  username,
  templateName,
  'models'
);

let templateFolder = path.join(snapdevTemplateFolder, username, templateName);

const setupBeforeStart = async () => {
  let stdout;

  // logout
  // console.log('Logging out...');
  // stdout = await cli(`logout --force`);
  // expect(stdout).toEqual(expect.stringContaining(`Removed login credentials`));

  // login
  // console.log('Logging in...');
  // stdout = await cli(`login --username ${username} --password ${password}`);
  // expect(stdout).toEqual(expect.stringContaining(`Login Succeeded`));
};

const setupBeforeEach = async () => {
  cwd = path.join(process.cwd(), 'cwd');
  await fs.remove(cwd);
  await fs.mkdir(cwd);

  let stdout;

  // create test project
  stdout = await cli(`init ${projectName}`);
  expect(stdout).toEqual(
    expect.stringContaining(`Created: ${snapdevJsonFile}`)
  );

  // login
  stdout = await snapdev(`login --username ${username} --password ${password}`);
  expect(stdout).toEqual(expect.stringContaining(`Logged in as: snapdevtest`));
  expect(stdout).toEqual(expect.stringContaining(`Login Succeeded`));

  // remove test-app
  stdout = await cli(
    `delete ${username}/test-app --remote --force`,
    snapdevFolder
  );
  // console.log(stdout);

  // logout
  stdout = await cli(`logout --force`);
};

const snapdev = (args) => {
  return cli(args, snapdevFolder);
};

const cli = (args = '', overrideCWD) => {
  if (overrideCWD) {
    cwd = overrideCWD;
  }
  // console.log(cwd);
  return new Promise((resolve, reject) => {
    let stdout = '';
    let stderr = '';
    const command = `snapdev ${args}`;
    const child = spawn(command, { cwd });

    child.on('error', (error) => {
      reject(error);
    });

    child.stdout.on('data', (data) => {
      stdout += data.toString();
    });

    child.stderr.on('data', (data) => {
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

// const createTestAppTemplate = async () => {
//   let stdout = await cli('create test-app', snapdevFolder);
//   // console.log(stdout);
//   expect(stdout).toEqual(
//     expect.stringContaining(`Switched to ${username}/test-app`)
//   );
//   return stdout;
// };

// const createNoUserTestAppTemplate = async () => {
//   let stdout = await cli('create test-app', snapdevFolder);
//   // console.log(stdout);
//   expect(stdout).toEqual(expect.stringContaining(`Switched to test-app`));
//   return stdout;
// };

// const createTestApp2Template = async () => {
//   let stdout = await cli('create test-app-2', snapdevFolder);
//   // console.log(stdout);
//   expect(stdout).toEqual(
//     expect.stringContaining(`Switched to ${username}/test-app-2`)
//   );
//   return stdout;
// };

// const createNoUserTestApp2Template = async () => {
//   let stdout = await cli('create test-app-2', snapdevFolder);
//   // console.log(stdout);
//   expect(stdout).toEqual(expect.stringContaining(`Switched to test-app-2`));
//   return stdout;
// };

// const checkoutTestAppTemplate = async () => {
//   let stdout = await cli('checkout test-app', snapdevFolder);
//   // console.log(stdout);
//   expect(stdout).toEqual(
//     expect.stringContaining(`Switched to ${username}/test-app`)
//   );
//   return stdout;
// };

// const checkoutNoUserTestAppTemplate = async () => {
//   let stdout = await cli('checkout test-app', snapdevFolder);
//   // console.log(stdout);
//   expect(stdout).toEqual(expect.stringContaining(`Switched to test-app`));
//   return stdout;
// };

// const generateTestAppTemplate = async () => {
//   let stdout = await cli('generate', snapdevFolder);
//   // console.log(stdout);
//   expect(stdout).toEqual(
//     expect.stringContaining(`Template name: ${username}/test-app`)
//   );
//   expect(stdout).toEqual(expect.stringContaining(`Generate for all models`));
//   expect(stdout).toEqual(
//     expect.stringContaining(`Model filename: default.json`)
//   );
//   expect(stdout).toEqual(
//     expect.stringContaining(`========== Source Code ==========`)
//   );
//   expect(stdout).toEqual(expect.stringContaining(`MyModel.java`));
//   return stdout;
// };

// const generateNoUserTestAppTemplate = async () => {
//   let stdout = await cli('generate', snapdevFolder);
//   // console.log(stdout);
//   expect(stdout).toEqual(expect.stringContaining(`Template name: test-app`));
//   expect(stdout).toEqual(expect.stringContaining(`Generate for all models`));
//   expect(stdout).toEqual(
//     expect.stringContaining(`Model filename: default.json`)
//   );
//   expect(stdout).toEqual(
//     expect.stringContaining(`========== Source Code ==========`)
//   );
//   expect(stdout).toEqual(expect.stringContaining(`MyModel.java`));
//   return stdout;
// };

module.exports = {
  cwd,
  setupBeforeStart,
  setupBeforeEach,
  cli,
  snapdev,
  username,
  password,
  projectName,
  projectFolder,
  snapdevFolder,
  snapdevJsonFile,
  templateModelFolder,
  snapdevTemplateFolder,
  // createTestAppTemplate,
  // createTestApp2Template,
  // checkoutTestAppTemplate,
  // generateTestAppTemplate,
  // createNoUserTestAppTemplate,
  // createNoUserTestApp2Template,
  // checkoutNoUserTestAppTemplate,
  // generateNoUserTestAppTemplate,
  templateFolder,
  snapdevDistFolder,
};
