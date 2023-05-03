const fs = require('fs');
const path = require('path');
const util = require("util");

const readdir = util.promisify(fs.readdir);
const mkdir = util.promisify(fs.mkdir);
const rename = util.promisify(fs.rename);
const rmdir = util.promisify(fs.rmdirSync);

function mkDir(folderPath, folderName){
    return mkdir(folderPath, { recursive: true }).then(() => {
        console.log('Directory %s was created', folderName);
    })
    .catch(err => {
        console.error(err);
    });
}

function moveFile(fileFrom, fileTo, file){
    fs.access(fileFrom, fs.constants.F_OK, async (err) => {
        return rename(fileFrom, fileTo).then(() => {
            console.log('File %s was copied', file);
        })
        .catch(err => {
            console.error(err);
        });
    });    
}

async function sortFiles(input, output, clear) {
    try {
        const files = await readdir(input);

        for(const file of files) {
            const localBase = path.join(input, file);
            const state = fs.statSync(localBase);

            if (state.isDirectory()) {
                await sortFiles(localBase, output, clear);
            } else {
                const folderName = file.charAt(0);
                const folderPath = path.join(output, folderName);
                const fileFrom = localBase;
                const fileTo = path.join(folderPath, file);

                await mkDir(folderPath, folderName);
                await moveFile(fileFrom, fileTo, file);
            }
        }

        if(clear) {
            await rmdir(input);
        }

    } catch (e) {
        console.error('outer', e.message);
    }
}

module.exports = sortFiles;