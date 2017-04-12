const mkdirp = require('mkdirp');
const fs = require('fs');
const getDirName = require('path').dirname;

module.exports = {

    cleanDir: function(dirPath) {
        let files = [];
        try {
            files = fs.readdirSync(dirPath);
        } catch (e) {
            return;
        }
        if (files.length > 0) {
            for (let i = 0; i < files.length; i++) {
                let filePath = dirPath + '/' + files[i];
                if (fs.statSync(filePath).isFile())
                    fs.unlinkSync(filePath);
                else
                    this.cleanDir(filePath);
            }
        }
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