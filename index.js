const clear = require('clear');
const program = require('commander');
const colors = require('colors');
const fs = require('fs');
const path = require('path');
const packages = require('./models/index').models();
const dir = require("node-dir");
const mustache = require("mustache");
const helpers = require("./helpers");

program.parse(process.argv);

const distFolder = __dirname + "/dist";

// TODO: get this from args
const packageName = "android-mvp-activity";

const snapPackages = packages.filter(m => { return m.name === packageName; });
let snapPackage;

if (snapPackages.length === 0) {
    console.log(colors.red("Snap package not found: " + snapPackage));
    process.exit();
} else {
    snapPackage = snapPackages[0];
    console.log(colors.green("Snap Package: " + snapPackage.name));
}

const baseDir = __dirname + "/templates/" + snapPackage.dir;
//console.log("Location:" + baseDir);

// get JSON from default model
const defaultDataFileName = __dirname + "/models/" + snapPackage.name + ".json";
let defaultData = JSON.parse(fs.readFileSync(defaultDataFileName, 'utf8'));
// TODO: get data from args and merge with default data
let argData = Object.assign({}, defaultData);

// clean dist folder and create new files
helpers.cleanDir(distFolder);

console.log(colors.yellow("Generated files:"));

dir.readFiles(baseDir,
    function(error, content, filename, next) {
        if (error) {
            console.log(colors.red(error));
            process.exit();
        }

        // get just the filename without path
        let fname = path.basename(filename);
        // find the file from the config
        let fnameOut = snapPackage.files.filter(file => { return file.src === fname; });
        if (fnameOut.length == 0) {
            console.log(colors.red(fname + " not found in snap package configuration"));
            process.exit();
        }

        // parse the template
        let newContent = mustache.render(content, argData);

        // prepare out filename
        let fout = fnameOut[0];
        let fdist;
        if (fout.toLowerCase)
            fdist = mustache.render(fout.dist, argData).toLocaleLowerCase();
        else
            fdist = mustache.render(fout.dist, argData);

        //output the new file names
        helpers.writeToFile(distFolder + "/" + fdist, newContent, (error, results) => {
            if (error) {
                console.log(colors.red(error));
                process.exit();
            }
        });

        console.log(fdist);

        next();
    },
    function(error, files) {
        if (error) {
            console.log(colors.red(error));
            process.exit();
        }
        //console.log('finished reading files:', files);
    });