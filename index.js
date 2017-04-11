const clear = require('clear');
const program = require('commander');
const colors = require('colors');
const fs = require('fs');

const packages = require("./models/index").models();
const dir = require("node-dir");
const mustache = require("mustache");

console.log("SnapDev started".yellow);

program.parse(process.argv);

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
console.log("Location:" + baseDir);

// get JSON from default model
const defaultDataFileName = __dirname + "/models/" + snapPackage.name + ".json";
let defaultData = JSON.parse(fs.readFileSync(defaultDataFileName, 'utf8'));
// TODO: get data from args and merge with default data
let argData = Object.assign({}, defaultData);

dir.readFiles(baseDir,
    function(err, content, filename, next) {
        if (err) throw err;

        // parse the template
        let output = mustache.render(content, argData);

        console.log(filename);

        next();
    },
    function(err, files) {
        if (err) throw err;
        //console.log('finished reading files:', files);
    });