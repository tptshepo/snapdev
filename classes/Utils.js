const path = require('path');
const fs = require('fs-extra');
const klaw = require('klaw');
const json = require('json-update');
const mkdirp = require('mkdirp');
const colors = require('colors');

let dirToKeep = [];
const cleanDirectory2 = (dirPath, params) => {
  const defaults = {
    deleteSelf: false,
    force: false,
    excludeDir: [],
    excludeFile: [],
  };
  const options = Object.assign(defaults, params);
  if (options.excludeDir.indexOf('snapdev') === -1) {
    options.excludeDir.push('snapdev');
  }
  if (options.rootDir === undefined) {
    // Use this block as init for cleanDirectory2
    options.rootDir = dirPath;
    dirToKeep = [];
  }

  // console.log('OPTIONS', options);

  const relativePath = dirPath.replace(options.rootDir, '');
  if (
    options.excludeDir.filter(
      (i) => i.toLowerCase() === relativePath.toLowerCase()
    ).length > 0
  ) {
    // don't remove this folder if not forced
    if (!options.force) {
      console.log(colors.yellow('[EXCLUDE]'), relativePath);
      return;
    }
    // always keep snapdev folder
    if (relativePath === 'snapdev') {
      return;
    }
  }

  // get files in this dirPath
  let files = [];
  files = fs.readdirSync(dirPath);
  if (files.length > 0) {
    for (let i = 0; i < files.length; i++) {
      let filePath = path.join(dirPath, files[i]);
      let isFile;

      try {
        isFile = fs.statSync(filePath).isFile();
      } catch (error) {
        continue;
      }

      if (isFile) {
        /** FILE */
        const relativePath = filePath.replace(options.rootDir, '');
        if (
          options.excludeFile.filter(
            (i) => i.toLowerCase() === relativePath.toLowerCase()
          ).length > 0
        ) {
          // don't remove the this file if not forced
          if (!options.force) {
            dirToKeep.push(dirPath);
            console.log(colors.yellow('[EXCLUDE]'), relativePath);
          } else {
            // console.log(relativePath);
            fs.removeSync(filePath);
          }
        } else {
          // console.log(relativePath);
          fs.removeSync(filePath);
        }
      } else {
        /** Folder */
        cleanDirectory2(filePath, Object.assign(options, { deleteSelf: true }));
      }
    }
  }
  if (options.deleteSelf) {
    // console.log('[DELETE]', dirPath);
    /** do not delete the root folder */
    if (options.rootDir !== dirPath) {
      try {
        let canRemove = true;
        for (let index = 0; index < dirToKeep.length; index++) {
          const dir = dirToKeep[index];
          if (dir.indexOf(dirPath) > -1) {
            canRemove = false;
          }
        }

        if (canRemove) {
          // console.log(dirToKeep);
          fs.removeSync(dirPath);
        }
      } catch (error) {
        return;
      }
    }
  }
};

const cleanDirectory = (dirPath, deleteSelf = false, force = false) => {
  let files = [];
  try {
    // console.log(path.basename(dirPath));
    if (path.basename(dirPath) === 'node_modules' && !force) {
      // don't remove the this folder if not forced
      return;
    }

    files = fs.readdirSync(dirPath);
  } catch (e) {
    return;
  }
  if (files.length > 0) {
    for (let i = 0; i < files.length; i++) {
      //console.log(colors.yellow(files[i]));

      let filePath = path.join(dirPath, files[i]);
      if (fs.statSync(filePath).isFile()) {
        fs.unlinkSync(filePath);
      } else {
        cleanDirectory(filePath, true, force);
      }
    }
  }
  if (deleteSelf) {
    // console.log('[DELETE]', dirPath);
    fs.rmdirSync(dirPath);
  }
};

const writeToFile = (filename, content, callback) => {
  mkdirp.sync(path.dirname(filename));
  fs.writeFile(filename, content, function (error) {
    if (error) {
      callback(error, null);
      return;
    }
    callback(null, {});
  });
};

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
  writeToFile,
  cleanDirectory,
  cleanDirectory2,
};
