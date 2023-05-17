const koa = require('koa');
const static = require('koa-static');
const session = require('koa-session');
const koaPug = require('koa-pug');

const config = require('./config');
const router = require('./routes');
const errorHandler = require('./libs/error');

const app = new koa();
const pug = new koaPug(config.pug);

pug.use(app);
app.use(static('./public'));
app.use(errorHandler);

app.on('error', (err, ctx) => {
  ctx.response.body = {}
  ctx.render('pages/error', {
    status: ctx.response.status,
    error: ctx.response.message,
  });
});

app.use(session(config.session, app));
app.use(router.routes());
app.use(router.allowedMethods());

const port = process.env.PORT || 3001;

app.listen(port, () => {
  console.log('API started on port :' + port);
});
