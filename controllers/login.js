module.exports.get = async ctx => {
    await ctx.render('pages/login');
}

module.exports.post = async ctx => {
    if (ctx.request.body.email === 'adm@adm.ru' && ctx.request.body.password === 'admin') {
        ctx.session.isAdmin = true;
        ctx.redirect('/admin');
    } else {
        await ctx.render('pages/login', {
            msglogin: 'Неправильный логин или пароль!'
        });
    }
}
