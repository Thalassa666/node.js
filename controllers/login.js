module.exports.get = function (req, res) {
    res.render('pages/login');
}

module.exports.post = function (req, res) {
    if (req.body.email === 'adm@adm.ru' && req.body.password === 'admin') {
        req.session.isAdmin = true;
        res.redirect('/admin')
    } else {
        res.render('pages/login', {
            msglogin: 'Неправильный логин или пароль!'
        });
    }
}