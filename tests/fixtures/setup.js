const path = require('path');
const fs = require('fs-extra');
const now = require('performance-now');
const request = require('superagent');
const config = require('config');
const klaw = require('klaw');

let exec = require('child_process').exec;

let cwd = path.join(process.cwd(), 'cwd');

// API
const usersAPI = config.snapdevHost + config.usersAPI;
const templatesAPI = config.snapdevHost + config.templatesAPI;

let username = 'snapdevtest';
let email = 'test@snapdev.co.za';
let password = '12345678';

let username2 = 'snapdevtest2';
let email2 = 'test2@snapdev.co.za';

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
  const fullpath = snapdevFolder + relativeFolder;
  await fs.mkdir(fullpath);
  return fullpath;
};

const touch = (filename, content = '') => {
  return new Promise((resolve, reject) => {
    fs.writeFile(filename, content, function (error) {
      if (error) {
        reject(error);
      } else {
        resolve(filename);
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

const ls = (rootDir) => {
  return new Promise((resolve) => {
    const items = [];
    klaw(rootDir)
      .on('data', (item) => {
        if (!item.stats.isDirectory()) {
          items.push(item.path);
        }
      })
      .on('end', () => resolve(items));
  });
};

const sdExt = (files) => {
  return hasExt(files, '.sd');
};

const hasExt = (files, ext) => {
  let noExt = false;
  files.forEach(file => {
    if (path.extname(file) !== ext) {
      noExt = true;
    }
  });  
  return !noExt;
};

const setupBeforeStart = async () => {};

const setupBeforeEach = async () => {
  let result;

  cwd = path.join(process.cwd(), 'cwd');
  await fs.remove(cwd);
  await fs.mkdir(cwd);

  // logout
  result = await cli(`logout --force --local`);

  // remove all DB users
  await request.delete(usersAPI + '/testing/all').send();
  // remove all templates
  await request.delete(templatesAPI + '/testing/all').send();

  // create test project
  result = await cli(`init ${projectName}`);
};

const setupAfterEach = async () => {};

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

module.exports = {
  cwd,
  setupBeforeStart,
  setupBeforeEach,
  cli,
  snapdev,
  username,
  username2,
  password,
  email,
  email2,
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
  ls,
  sdExt,
};
