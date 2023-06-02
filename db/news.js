const mongoose = require('mongoose');
const Schema = mongoose.Schema;

mongoose.Promise = global.Promise;

const newsScheme = new Schema(
  {
    id: {
      type: Number,
      required: true
    },
    text: String,
    title: String,
    user: { type: Schema.Types.ObjectId, ref: 'user' }
  },
  { timestamps: true }
);

module.exports.News = mongoose.model('news', newsScheme);
