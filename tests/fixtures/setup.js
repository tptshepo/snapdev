const path = require('path');
const fs = require('fs-extra');
const now = require('performance-now');
const request = require('superagent');
const config = require('config');
const klaw = require('klaw');
const json = require('json-update');
const homePath = require('home-path');

const { exec } = require('child_process');

let cwd = path.join(process.cwd(), 'cwd');

// API
const { snapdevHost } = config;
const usersAPI = config.snapdevHost + config.apiv1 + config.usersAPI;
const templatesAPI = config.snapdevHost + config.apiv1 + config.templatesAPI;
const templateModelsAPI = config.snapdevHost + config.apiv1 + config.templateModelsAPI;

const username = 'snapdevtest';
const email = 'test@snapdev.co.za';
const password = '12345678';

const username2 = 'snapdevtest2';
const email2 = 'test2@snapdev.co.za';

const projectName = 'my-project-test';
const templateName = 'test-app';
const projectFolder = path.join(cwd, projectName);
const snapdevFolder = path.join(projectFolder, 'snapdev');
const snapdevDistFolder = path.join(snapdevFolder, 'dist');
const snapdevModelsFolder = path.join(snapdevFolder, 'models');
const snapdevTemplateFolder = path.join(snapdevFolder, 'templates');
const snapdevJsonFile = path.join(snapdevFolder, 'snapdev.json');

const snapdevHome = path.join(homePath(), config.homeFolder);
const credentialFile = path.join(snapdevHome, 'credentials');

const templateModelFolderWithUser = path.join(snapdevTemplateFolder, username, templateName, 'models');

const templateModelFolderWithNoUser = path.join(snapdevTemplateFolder, templateName, 'models');

const templateFolderWithUser = path.join(snapdevTemplateFolder, username, templateName);
const templateFolderWithNoUser = path.join(snapdevTemplateFolder, templateName);

const templateSchemaDefFileWithUser = path.join(templateFolderWithUser, 'schema.json');

const templateSchemaDefFileWithNoUser = path.join(templateFolderWithNoUser, 'schema.json');

const readFile = (filename) =>
  new Promise((resolve, reject) => {
    fs.readFile(filename, 'utf8', function (err, data) {
      if (err) {
        reject(err);
      } else {
        resolve(data);
      }
    });
  });

const readJSON = async (filename) => {
  const data = await json.load(filename);
  return data;
};

const updateJSON = async (filename, jsonObject) => {
  await json.update(filename, jsonObject);
  return true;
};

const remove = async (dirOrFile) => {
  await fs.remove(dirOrFile);
};

const copy = async (from, to) => {
  await fs.copy(from, to);
};

const mkdir = async (relativeFolder) => {
  const fullpath = snapdevFolder + relativeFolder;
  await fs.mkdir(fullpath);
  return fullpath;
};

const touch = (filename, content = '') =>
  new Promise((resolve, reject) => {
    fs.writeFile(filename, content, function (error) {
      if (error) {
        reject(error);
      } else {
        resolve(filename);
      }
    });
  });

const exists = (filename) =>
  new Promise((resolve) => {
    fs.exists(filename, function (found) {
      resolve(found);
    });
  });

const ls = (rootDir) =>
  new Promise((resolve) => {
    const items = [];
    klaw(rootDir)
      .on('data', (item) => {
        if (!item.stats.isDirectory()) {
          items.push(item.path);
        }
      })
      .on('end', () => resolve(items));
  });

const hasExt = (files, ext) => {
  let noExt = false;
  files.forEach((file) => {
    if (path.extname(file) !== ext) {
      noExt = true;
    }
  });
  return !noExt;
};

const sdExt = (files) => hasExt(files, '.sd');

const cli = (args = '', overrideCWD) => {
  if (overrideCWD) {
    cwd = overrideCWD;
  }
  return new Promise((resolve) => {
    const start = now();
    // const cmdArgs = args;
    exec(`node ${path.resolve('./bin/snapdev')} ${args}`, { cwd }, (error, stdout, stderr) => {
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
    });
  });
};

const snapdev = (args) => cli(args, snapdevFolder);

const setupBeforeStart = async () => {};

const setupBeforeEach = async () => {
  // let result;

  cwd = path.join(process.cwd(), 'cwd');
  await fs.remove(cwd);
  await fs.mkdir(cwd);

  // logout
  await cli(`logout --force --local`);

  // remove all DB users
  await request.delete(`${usersAPI}/testing/all`).send();
  // remove all templates
  await request.delete(`${templatesAPI}/testing/all`).send();
  await request.delete(`${templateModelsAPI}/testing/all`).send();

  // create test project
  await cli(`init ${projectName}`);
};

// const setupAfterEach = async () => {};

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
  templateModelFolderWithUser,
  templateModelFolderWithNoUser,
  snapdevTemplateFolder,
  templateFolderWithUser,
  templateFolderWithNoUser,
  templateSchemaDefFileWithUser,
  templateSchemaDefFileWithNoUser,
  snapdevDistFolder,
  mkdir,
  touch,
  exists,
  ls,
  copy,
  sdExt,
  readJSON,
  updateJSON,
  remove,
  readFile,
  snapdevModelsFolder,
  templateModelsAPI,
  snapdevHost,
  snapdevHome,
  credentialFile,
};
