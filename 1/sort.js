const fs = require('fs')
const path = require('path')

function createDir(path, callback) {
  fs.access(path, fs.constants.F_OK, err => {
    if (!err) {
      const err = new Error('Directory exist')
      err.code = 'EEXIST'
      return callback(err)
    }

    fs.mkdir(path, err => {
      if (err) {
        return callback(err)
      }

      callback(null)
    })
  })
}

function readDir(dirpath, callback) {
  let results = []
  fs.readdir(dirpath, (err, files) => {
    if (err) {
      callback(err, null)
    }

    let counter = files.length

    if (counter === 0) {
      return callback(null, results)
    }

    files.forEach(file => {
      const filepath = path.join(dirpath, file)

      fs.stat(filepath, (err, stats) => {
        if (err) {
          callback(err, null)
        }

        if (stats.isDirectory()) {
          readDir(filepath, (err, res) => {
            if (err) {
              callback(err, null)
            }

            results = results.concat(res)

            if (--counter === 0) {
              callback(null, results)
            }
          })
        } else {
          results.push({ name: file, path: filepath })

          if (--counter === 0) {
            callback(null, results)
          }
        }
      })
    })
  })
}

module.exports = {
  create: createDir,
  read: readDir
}