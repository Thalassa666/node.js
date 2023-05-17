const fs = require('fs');
const db = require('../models/db');

module.exports.get = async ctx => {
    const skills = JSON.parse(fs.readFileSync('./db/skills.json'));
    const products = await db.getCollection('products');

    await ctx.render('pages/index', {
        skillsData: skills,
        products: products
    });
}

module.exports.post = async ctx => {
    const skills = JSON.parse(fs.readFileSync('./db/skills.json'));
    const products = await db.getCollection('products');
    let msg = 'Спасибо за ваше обращение!';

    try {
        await db.addDoc('messages', {
            ...ctx.request.body
        });
    } catch (err) {
        console.log(err);
        msg = 'При отправке сообщения произошла ошибка';
    }

    await ctx.render('pages/index', {
        skillsData: skills,
        products: products,
        msgemail: msg
    });
}
