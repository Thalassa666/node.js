const { validateData } = require('../helpers');
const { NewsDB } = require('../db');

const getNews = async () => {
  const newsList = await NewsDB.News.find()
    .populate({
      path: 'user',
      match: {}, 
      select: ['id', 'firstName', 'image', 'middleName', 'surName', 'username']
    })
    .exec();

  const newsModified = newsList.map((news) => {
    if (!news.user) {
      return {
        ...news._doc,
        user: {
          id: -1,
          firstName: '',
          image: null,
          middleName: '',
          surName: '',
          username: ''
        }
      };
    }
    return news;
  });

  return newsModified;
};
module.exports.getNews = getNews;

module.exports.packNewsData = async (newsObj, userObj) => {
  if (validateData(newsObj) && userObj) {
    const newsCount = await NewsDB.News.countDocuments({});
    let id = 0;

    if (newsCount) {
      const newsLast = await NewsDB.News.find().sort({ _id: -1 }).limit(1);
      id = newsLast[0].id + 1;
    }

    return {
      id,
      text: newsObj.text,
      title: newsObj.title,
      created_at: new Date(Date.now()).toUTCString(),
      user: userObj._id
    };
  }
  return null;
};

module.exports.saveNews = async (newsObj) => {
  try {
    const doc = await newsObj.save();
    console.log('News saved:', doc);
    return await getNews();
  } catch (error) {
    console.error(error);
    return false;
  }
};

module.exports.deleteNews = async (id) => {
  try {
    const status = await NewsDB.News.deleteOne({ id });
    if (status && status.ok === 1) {
      console.log('News deleted:', status);
      return await getNews();
    } else {
      throw new Error('Ошибка удаления из БД');
    }
  } catch (error) {
    console.error(error);
    return false;
  }
};

module.exports.updateNews = async (id, body) => {
  try {
    const news = await NewsDB.News.findOne({ id });
    news.title = body.title;
    news.text = body.text;
    const status = await NewsDB.News.updateOne({ id }, news);
    if (status && status.ok === 1) {
      console.log('User updated:', news);
      return await getNews();
    } else {
      throw new Error('Ошибка изменения данных в БД');
    }
  } catch (error) {
    console.error(error);
    return false;
  }
};
