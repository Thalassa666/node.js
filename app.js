const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const session = require('express-session');

const app = express();

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: false
}));

app.use(
    session({
        secret: '5NIk4Lb4',
        key: 'sessionkey',
        cookie: {
            path: '/',
            httpOnly: true,
            maxAge: 10 * 60 * 1000
        },
        saveUninitialized: false,
        resave: false
    })
);

app.use(express.static(path.join(__dirname, 'public')));

const routeIndex = require('./routes/index');

app.use('/', routeIndex);

app.use(function (req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

app.use(function (err, req, res, next) {
    res.status(err.status || 500);
    res.render('pages/error', {
        message: err.message,
        error: err
    });
});

const server = app.listen(process.env.PORT || 3001, function () {
    console.log('API started on port :' + server.address().port);
});