const fs = require('fs');
const path = require('path');

function mkDir(folderPath, folderName){
    return new Promise(resolve => {
        fs.mkdir(folderPath, { recursive: true }, (err) => {
            if (err) throw err;
            console.log('Directory %s was created', folderName);
            resolve('Directory %s was created', folderName);
        });
    });
}

function moveFile(fileFrom, fileTo, file){
    return new Promise(resolve => {
        fs.access(fileFrom, fs.constants.F_OK, (err) => {
            if (err) throw err
            fs.rename(fileFrom, fileTo, function (err) {
                if (err) throw err
                console.log('File %s was copied', file);
                resolve('File %s was copied', file);
            });
        });       
    });
}

async function sortFiles(input, output, clear) {
    try {
        const files = fs.readdirSync(input);

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
            fs.rmdirSync(input);
        }

    } catch (e) {
        console.error('outer', e.message);
    }
}

module.exports = sortFiles;