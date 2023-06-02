const bcrypt = require('bcryptjs');

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

mongoose.Promise = global.Promise;

const userScheme = new Schema(
  {
    firstName: String,
    id: {
      type: Number,
      required: true
    },
    image: String,
    middleName: String,
    permission: {
      chat: { C: Boolean, R: Boolean, U: Boolean, D: Boolean },
      news: { C: Boolean, R: Boolean, U: Boolean, D: Boolean },
      settings: { C: Boolean, R: Boolean, U: Boolean, D: Boolean }
    },
    surName: String,
    username: String,
    password: {
      type: String,
      required: true
    }
  },
  { timestamps: true }
);

userScheme.pre('save', function (next) {
  bcrypt.hash(this.password, 10, (err, hash) => {
    if (err) {
      console.error(err);
      return next();
    }
    this.password = hash;
    next();
  });
});

userScheme.pre('updateOne', function (next) {
  bcrypt.hash(this._update.password, 10, (err, hash) => {
    if (err) {
      console.error(err);
      return next();
    }
    this._update.password = hash;
    next();
  });
});

userScheme.methods.comparePassword = function (candidatePassword) {
  const password = this.password;
  return new Promise((resolve, reject) => {
    bcrypt.compare(candidatePassword, password, (err, success) => {
      if (err) return reject(err);
      return resolve(success);
    });
  });
};

module.exports.User = mongoose.model('user', userScheme);
