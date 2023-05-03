const path = require('path');
const sortFiles  = require('./sort');

const input = process.argv[2] !== undefined ? process.argv[2] : path.join(__dirname, 'input');
const output = process.argv[3] !== undefined ? process.argv[3] : path.join(__dirname, 'output');
const clear = process.argv[4] !== undefined ? true : false;

sortFiles(input, output, clear);