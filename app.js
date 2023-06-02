require('dotenv').config();
const PORT = process.env.PORT || 3000;

const path = require('path');
const bodyParser = require('body-parser');
const session = require('express-session');
const cors = require('cors');
const express = require('express');
const app = express();
const socketRun = require('./chat');
const server = require('http').Server(app);
const io = require('socket.io')(server);

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use(
  session({
    secret: 'common:session',
    key: 'sessionkey',
    cookie: {
      path: '/',
      httpOnly: true,
      maxAge: 10 * 60 * 1000
    },
    resave: false,
    saveUninitialized: false
  })
);

app.use(express.static(path.join(__dirname, 'public')));

app.use(cors());
app.use('/', require('./routes'));

server.listen(PORT, () => {
  console.log('CORS-enabled web server');
  console.log(`Сервер запущен на порту ${PORT}`);
});

socketRun(io);

app.use((err, req, res, next) => {
  if (err) {
    console.error(err.stack);
    res.status(500).send('Something broke!');
  } else {
    next();
  }
});

process.on('uncaughtException', (err) => {
  console.error(
    `${new Date().toUTCString()} uncaught exception: ${err.message}`
  );
  console.error(err.stack);
  process.exit(1);
});
