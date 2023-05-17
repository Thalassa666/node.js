const express = require('express');
const router = express.Router();

const ctrlHome = require('../controllers/home');
const ctrlLogin = require('../controllers/login');
const ctrlAdmin = require('../controllers/admin');

const isAdmin = (req, res, next) => {
    if (req.session.isAdmin) {
        return next();
    }
    res.redirect('/login');
}

router.get('/', ctrlHome.get);
router.post('/', ctrlHome.post);

router.get('/login', ctrlLogin.get);
router.post('/login', ctrlLogin.post);

router.get('/admin', isAdmin, ctrlAdmin.get);
router.post('/admin/upload', isAdmin, ctrlAdmin.addProduct);
router.post('/admin/skills', isAdmin, ctrlAdmin.updateSkills);

module.exports = router;