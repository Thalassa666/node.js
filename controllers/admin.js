const fs = require('fs');
const path = require('path');
const db = require('../models/db');
const util = require('util');
const rename = util.promisify(fs.rename);

module.exports.get = async ctx => {
  const skills = JSON.parse(fs.readFileSync('./db/skills.json'));

  await ctx.render('pages/admin', {
    skills: skills
  });
}

module.exports.updateSkills = ctx => {
  fs.writeFileSync('./db/skills.json', JSON.stringify(ctx.request.body));
  ctx.redirect('/admin');
}

module.exports.addProduct = async ctx => {
  const upload = path.join(process.cwd(), 'public', 'uploads');

  if (!fs.existsSync(upload)) {
    fs.mkdirSync(upload);
  }

  const fileName = Math.random().toString(36).substr(2, 8) + '.' + ctx.request.files.photo.name.split('.').pop();
  const filePath = path.join(upload, fileName);
  const errUpload = await rename(ctx.request.files.photo.path, filePath);

  if (errUpload) {
    return (ctx.body = {
      mes: 'При загрузке картинки произошла ошибка',
      status: 'Error'
    });
  }

  await db.addDoc('products', {
    src: '/uploads/' + fileName,
    name: ctx.request.body.name,
    price: ctx.request.body.price
  });

  ctx.redirect('/admin');
}
