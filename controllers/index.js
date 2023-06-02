const UsersAPI = require('../api/users');
const NewsAPI = require('../api/news');

const { UserDB, NewsDB } = require('../db');

module.exports.get = async (req, res) => {
  const url = req.url;
  let status = null;

  switch (url) {
    case '/api/profile':
      if (req.headers.authorization) {
        status = await UsersAPI.getUserByJWT(req.headers.authorization);
      }
      break;

    case '/api/news':
      status = await NewsAPI.getNews();
      break;

    case '/api/users':
      status = await UsersAPI.getUsers();
      break;

    default:
      res.redirect('/');
      break;
  }
  if (status) {
    res.status(200).json(status);
  }
};

module.exports.post = async (req, res) => {
  const url = req.url;
  const body = req.body;
  let userData = null;
  let newsData = null;
  let checkedUser = null;

  switch (url) {
    case '/api/registration':
      userData = await UsersAPI.packUserData(body);
      if (userData) {
        const newUser = new UserDB.User({ ...userData });
        const saveStatus = await UsersAPI.saveUserData(newUser);
        if (saveStatus) {
          const obj = await UsersAPI.checkUserData(body);
          res.status(201).json(UsersAPI.genToken(obj));
        } else {
          res.status(401).json({ message: 'Пользователь уже существует' });
        }
      } else {
        res.status(401).json({ message: 'Введите все поля' });
      }
      break;

    case '/api/login':
      checkedUser = await UsersAPI.checkUserData(body);
      if (checkedUser) {
        req.session.isAuth = true;
        req.session.uid = checkedUser.id;
        res.status(202).json(UsersAPI.genToken(checkedUser));
      } else {
        res.status(401).json({ message: 'Ошибка ввода имени или пароля' });
      }
      break;

    case '/api/refresh-token':
      if (req.headers.authorization) {
        const findUser = await UsersAPI.getUserByJWT(req.headers.authorization);
        if (findUser) {
          res.status(201).json(UsersAPI.genToken(findUser));
        } else {
          res.status(500).json({ message: 'Пользователь в БД не найден' });
        }
      }
      break;

    case '/api/news':
      if (req.headers.authorization) {
        const findedUser = await UsersAPI.getUserByJWT(
          req.headers.authorization
        );
        if (findedUser) {
          newsData = await NewsAPI.packNewsData(body, findedUser);
          if (newsData) {
            const newNews = new NewsDB.News({ ...newsData });
            const saveStatus = await NewsAPI.saveNews(newNews);
            if (saveStatus) {
              res.status(201).json(saveStatus);
            } else {
              res.status(204).json({ message: 'Ошибка сохранения' });
            }
          }
        }
      } else {
        res.status(204).json({ message: 'Введите все поля' });
      }
      break;

    default:
      res.json({ success: false, err: 'Error' });
      break;
  }
};

module.exports.userPermissionUpdate = async (req, res) => {
  const id = req.params.id;
  const body = req.body;
  const status = await UsersAPI.updateUserPermission(id, body);
  if (status) {
    res.status(200).json({ message: 'Права изменены' });
  } else {
    res.status(500).json({ message: 'Ошибка изменения прав' });
  }
};

module.exports.newsUpdate = async (req, res) => {
  const id = req.params.id;
  const body = req.body;
  const status = await NewsAPI.updateNews(id, body);

  if (status) {
    res.status(200).json(status);
  } else {
    res.status(500).json({ message: 'Ошибка изменения' });
  }
};

module.exports.profileUpdate = async (req, res, next) => {
  let currentUser = null;

  if (req.headers.authorization) {
    currentUser = await UsersAPI.getUserByJWT(req.headers.authorization);
    if (currentUser) {
      UsersAPI.updateProfile(currentUser, req, res, next);
    } else {
      res.status(500).json({ message: 'Пользователь не найден в БД' });
    }
  }
};

module.exports.delete = async (req, res) => {
  const what = req.url.match(/^\/?API\/.{0,5}\/?/i)[0];
  const id = req.params.id;
  let status = null;

  switch (what) {
    case '/api/users/':
      status = await UsersAPI.deleteUser(id);
      break;

    case '/api/news/':
      status = await NewsAPI.deleteNews(id);
      break;

    default:
      res.status(404).json({ message: 'Неизвестная ошибка' });
      break;
  }
  if (status) {
    res.status(200).json(status);
  } else {
    res.status(500).json({ message: 'Ошибка удаления' });
  }
};
