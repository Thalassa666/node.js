const koaRouter = require('koa-router');
const koaBody = require('koa-body');

const ctrlHome = require('../controllers/home');
const ctrlLogin = require('../controllers/login');
const ctrlAdmin = require('../controllers/admin');

const router = new koaRouter();

const isAdmin = (ctx, next) => {
    if (ctx.session.isAdmin) {
        return next();
    }
    ctx.redirect('/login');
}

router.get('/', ctrlHome.get);
router.post('/', koaBody(), ctrlHome.post);

router.get('/login', ctrlLogin.get);
router.post('/login', koaBody(), ctrlLogin.post);

router.get('/admin', isAdmin, ctrlAdmin.get);
router.post('/admin/skills', isAdmin, koaBody(), ctrlAdmin.updateSkills);
router.post('/admin/upload', isAdmin, koaBody({
    multipart: true,
    formidable: {
        uploadDir: process.cwd() + '/public/uploads'
    }
}), ctrlAdmin.addProduct);

module.exports = router;
