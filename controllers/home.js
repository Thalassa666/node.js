const fs = require('fs');
const db = require('../models/db');

module.exports.get = function (req, res) {
    db.getCollection('products').then(data => {
        res.render('pages/index', {
            skillsData: JSON.parse(fs.readFileSync('./db/skills.json')),
            products: data
        });
    });
}

module.exports.post = function (req, res) {
    db.addDoc('messages', {
        ...req.body
    }).then(() => {
        db.getCollection('products').then(data => {
            res.render('pages/index', {
                skillsData: JSON.parse(fs.readFileSync('./db/skills.json')),
                products: data,
                msgemail: 'Спасибо за ваше обращение!'
            });
        });
    });
}