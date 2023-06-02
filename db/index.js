const mongoose = require('mongoose');

const LOCAL_PATH = `mongodb://${process.env.DB_HOST}:${process.env.DB_PORT}/loft`;
const REMOTE_PASS = encodeURIComponent(process.env.REMOTE_DB_PASS);
const REMOTE_PATH = `mongodb+srv://${process.env.REMOTE_DB_USER}:${REMOTE_PASS}@cluster0-rktdm.mongodb.net/${process.env.REMOTE_DB_NAME}?retryWrites=true&w=majority`;

const mode = process.env.mode;
const dbPath = mode && mode === 'development' ? LOCAL_PATH : REMOTE_PATH;

const UserDB = require('./users');
const NewsDB = require('./news');

mongoose
  .connect(dbPath, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  })
  .then(() => {
    console.log('Connected to DB');
  })
  .catch((err) => {
    console.error(err);
  });

module.exports = {
  UserDB,
  NewsDB
};
