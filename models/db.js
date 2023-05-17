const path = require('path');
const fs = require('fs');
const dataDir = './db';

module.exports.addDoc = (collection, doc) => {
    return new Promise((res, rej) => {
        const collectionFile = path.join(dataDir, collection + '.json');

        if (fs.existsSync(collectionFile)) {
            docs = JSON.parse(fs.readFileSync(collectionFile));
            docs.push({
                id: Math.random().toString(36).substr(2, 8),
                ...doc
            });
            fs.writeFileSync(collectionFile, JSON.stringify(docs));
            res();
        } else {
            docs = [{
                id: Math.random().toString(36).substr(2, 8),
                ...doc
            }];
            fs.writeFileSync(collectionFile, JSON.stringify(docs));
            res();
        }
    });
}

module.exports.getCollection = (collection) => {
    return new Promise((res, rej) => {
        const collectionFile = path.join(dataDir, collection + '.json');

        if (fs.existsSync(collectionFile)) {
            res(JSON.parse(fs.readFileSync(collectionFile)));
        } else {
            res(null);
        }
    });
}
