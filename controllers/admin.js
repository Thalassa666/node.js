const fs = require('fs');
const path = require('path');
const formidable = require('formidable');
const db = require('../models/db');

module.exports.get = function (req, res) {
  res.render('pages/admin', {
    skills: JSON.parse(fs.readFileSync('./db/skills.json'))
  });
}

module.exports.updateSkills = function (req, res) {
  fs.writeFileSync('./db/skills.json', JSON.stringify(req.body));
  res.redirect('/admin');
}

module.exports.addProduct = function (req, res, next) {
  let form = new formidable.IncomingForm();
  let upload = path.join('./public', 'uploads');

  if (!fs.existsSync(upload)) {
    fs.mkdirSync(upload);
  }

  form.uploadDir = path.join(process.cwd(), upload);

  form.parse(req, function (err, fields, files) {
    if (err) {
      return next(err);
    }

    const fileName = path.join(upload, Math.random().toString(36).substr(2, 8) + '.' + files.photo.name.split('.').pop());

    fs.rename(files.photo.path, fileName, function (err) {
      if (err) {
        console.error(err.message);
        return;
      }

      let dir = fileName.substr(fileName.indexOf('\\')).replace(/(\\\\|\\)/g, '/');

      db.addDoc('products', {
        src: dir,
        name: fields.name,
        price: fields.price
      }).then(() => {
        res.redirect('/admin');
      });
    });
  });
}