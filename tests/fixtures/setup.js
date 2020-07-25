const path = require('path');
const fs = require('fs-extra');
const spawn = require('spawn-command');
const now = require('performance-now');

let exec = require('child_process').exec;

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

let templateFolderWithUser = path.join(
  snapdevTemplateFolder,
  username,
  templateName
);
let templateFolderWithNoUser = path.join(snapdevTemplateFolder, templateName);

const mkdir = async (relativeFolder) => {
  const fullpath = cwd + relativeFolder;
  await fs.mkdir(fullpath);
  return fullpath;
};

const touch = (filename, content = '') => {
  return new Promise((resolve, reject) => {
    fs.writeFile(filename, content, function (error) {
      if (error) {
        reject(error);
      } else {
        resolve();
      }
    });
  });
};

const exists = (filename) => {
  return new Promise((resolve) => {
    fs.exists(filename, function (found) {
        resolve(found);
    });
  });
};

const setupBeforeStart = async () => {};

const setupBeforeEach = async () => {
  cwd = path.join(process.cwd(), 'cwd');
  await fs.remove(cwd);
  await fs.mkdir(cwd);

  let result;

  // create test project
  result = await cli(`init ${projectName}`);
  expect(result.code).toBe(0);
  expect(result.stdout).toContain(`Created: ${snapdevJsonFile}`);

  // login
  result = await snapdev(`login --username ${username} --password ${password}`);
  expect(result.code).toBe(0);
  expect(result.stdout).toContain(`Logged in as: ${username}`);
  expect(result.stdout).toContain(`Login Succeeded`);

  // remove test-app
  result = await cli(
    `delete ${username}/test-app --remote --force`,
    snapdevFolder
  );

  // logout
  result = await cli(`logout --force`);
  expect(result.code).toBe(0);
};

const cli = (args = '', overrideCWD) => {
  if (overrideCWD) {
    cwd = overrideCWD;
  }
  return new Promise((resolve) => {
    const start = now();
    const cmdArgs = args;
    exec(
      `node ${path.resolve('./bin/snapdev')} ${args}`,
      { cwd },
      (error, stdout, stderr) => {
        const end = now();
        const diff = (end - start).toFixed(3);
        // console.log('args:', cmdArgs);
        // console.log(`Time: ${diff} s`);
        resolve({
          code: error && error.code ? error.code : 0,
          error,
          stdout,
          stderr,
          start: start.toFixed(3),
          end: end.toFixed(3),
          diff,
        });
      }
    );
  });
};

const snapdev = (args) => {
  return cli(args, snapdevFolder);
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
  templateFolderWithUser,
  templateFolderWithNoUser,
  snapdevDistFolder,
  mkdir,
  touch,
  exists,
};
