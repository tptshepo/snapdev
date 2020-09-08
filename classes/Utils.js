const path = require('path');
const fs = require('fs-extra');
const klaw = require('klaw');
const json = require('json-update');

const readFile = (filename) => {
  return new Promise((resolve, reject) => {
    fs.readFile(filename, 'utf8', function (err, data) {
      if (err) {
        reject(err);
      } else {
        resolve(data);
      }
    });
  });
};

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

const mkdir = async (path) => {
  await fs.mkdir(path);
  return path;
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
  files.forEach((file) => {
    if (path.extname(file) !== ext) {
      noExt = true;
    }
  });
  return !noExt;
};

module.exports = {
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
};
