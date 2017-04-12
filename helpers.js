const mkdirp = require('mkdirp');
const fs = require('fs');
const getDirName = require('path').dirname;
const colors = require('colors');

module.exports = {

    cleanDir: function(dirPath, deleteSelf = false) {
        let files = [];
        try {
            files = fs.readdirSync(dirPath);
        } catch (e) {
            return;
        }
        if (files.length > 0) {
            for (let i = 0; i < files.length; i++) {
                //console.log(colors.yellow(files[i]));

                let filePath = dirPath + '/' + files[i];
                if (fs.statSync(filePath).isFile())
                    fs.unlinkSync(filePath);
                else
                    this.cleanDir(filePath, true);
            }
        }
        if (deleteSelf)
            fs.rmdirSync(dirPath);
    },

    writeToFile: function(filename, content, callback) {
        mkdirp(getDirName(filename), function(error) {
            if (error) {
                callback(error, null);
                return;
            }

            fs.writeFile(filename, content, function(error) {
                if (error) {
                    callback(error, null);
                    return;
                }
                callback(null, {});
            });

        });
    }

}