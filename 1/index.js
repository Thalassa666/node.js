const fs = require('fs')
const path = require('path')
const yargs = require('yargs')
const directory = require('./sort')

const argv = yargs
  .usage('Usage: $0 [options]')
  .option('source', {
    alias: 'src',
    describe: 'source directory',
    type: 'string',
    default: path.join(__dirname, 'input_folder')
  })
  .option('destination', {
    alias: 'dest',
    describe: 'destination directory',
    type: 'string',
    default: path.join(__dirname, 'output')
  }).argv

const srcPath = argv.src
const destPath = argv.dest

directory.create(destPath, err => {
  if (err) {
    if (err.code === 'EEXIST') {
      console.error('Directory already exists.')
      process.exit(1)
    } else {
      console.error(err)
      process.exit(1)
    }
  }

  directory.read(srcPath, (err, files) => {
    if (err) {
      console.error(err)
      process.exit(1)
    }

    files = files.filter(file => {
      return !/^\./.test(file.name)
    })

    let counter = 0

    files.forEach(file => {
      const firstLetter = file.name[0]
      const dirPath = path.join(destPath, firstLetter)

      directory.create(dirPath, err => {
        if (err && err.code !== 'EEXIST') {
          console.error(err)
          process.exit(1)
        }

        fs.copyFile(file.path, path.join(dirPath, file.name), err => {
          if (err) {
            console.error(err)
            process.exit(1)
          }

          if (++counter === files.length) {
            console.log('Done')
          }
        })
      })
    })
  })
})