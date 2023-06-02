const formidable = require('formidable');
const fs = require('fs');
const path = require('path');
const Jimp = require('jimp');
const util = require('util');
const unlink = util.promisify(fs.unlink);

const moment = require('moment');
const jwt = require('jwt-simple');

const { UserDB } = require('../db');
const IMG_DEFAULT_PATH = null;

const { validateData } = require('../helpers');

const getUsers = async () => {
  return await UserDB.User.find({});
};

module.exports.getUsers = getUsers;

module.exports.packUserData = async (userObj, options = {}) => {
  if (validateData(userObj)) {
    const usersCount = await UserDB.User.countDocuments({});
    let id = 0;

    if (usersCount) {
      const usersLast = await UserDB.User.find().sort({ _id: -1 }).limit(1);
      id = usersLast[0].id + 1;
    }

    return {
      id,
      firstName: userObj.firstName,
      image: IMG_DEFAULT_PATH,
      middleName: userObj.middleName,
      permission: {
        chat: { C: true, R: true, U: true, D: true },
        news: { C: true, R: true, U: true, D: true },
        settings: { C: true, R: true, U: true, D: true }
      },
      surName: userObj.surName,
      username: userObj.username,
      password: userObj.password
    };
  }
  return null;
};

module.exports.saveUserData = async (obj) => {
  try {
    const userName = await UserDB.User.findOne({
      username: obj.username
    });
    if (!userName) {
      const doc = await obj.save();
      console.log('User saved:', doc);
      return true;
    } else {
      console.log('User exist!');
      return false;
    }
  } catch (error) {
    console.error(error);
    return false;
  }
};

module.exports.genToken = (user) => {
  const accessTokenExpiredAt = moment().utc().add({ minutes: 30 }).unix();
  const accessToken = jwt.encode(
    {
      exp: accessTokenExpiredAt,
      username: user.username
    },
    process.env.JWT_SECRET
  );
  const refreshTokenExpiredAt = moment().utc().add({ days: 30 }).unix();
  const refreshToken = jwt.encode(
    {
      exp: refreshTokenExpiredAt,
      username: user.username
    },
    process.env.JWT_SECRET
  );

  return {
    ...user._doc,
    accessToken: accessToken,
    accessTokenExpiredAt: Date.parse(
      moment.unix(accessTokenExpiredAt).format()
    ),
    refreshToken: refreshToken,
    refreshTokenExpiredAt: Date.parse(
      moment.unix(refreshTokenExpiredAt).format()
    )
  };
};

module.exports.getUserByJWT = async (token) => {
  try {
    const decodedData = jwt.decode(token, process.env.JWT_SECRET);
    const { username } = decodedData;
    const findUser = await UserDB.User.findOne({ username });

    if (findUser) {
      if (findUser._doc.hasOwnProperty('password')) {
        delete findUser._doc.password;
      }
      console.log('Get Profile Data:', findUser);
      return findUser;
    } else {
      throw new Error('Ошибка удаления из БД');
    }
  } catch (error) {
    console.error(error);
    return false;
  }
};

module.exports.checkUserData = async (user) => {
  try {
    const findUser = await UserDB.User.findOne({
      username: user.username
    });

    if (findUser) {
      const success = await findUser.comparePassword(user.password);
      if (success) {
        return findUser;
      } else {
        throw new Error('Пароли не совпадают');
      }
    } else {
      throw new Error('Пользователь не найден');
    }
  } catch (error) {
    console.error(error);
    return false;
  }
};

module.exports.findUserById = async (id) => {
  try {
    const findUser = await UserDB.User.findOne({
      id: id
    });

    if (findUser) {
      return findUser;
    } else {
      throw new Error('Пользователь не найден');
    }
  } catch (error) {
    console.error(error);
    return false;
  }
};

module.exports.updateUserPermission = async (id, body) => {
  try {
    const user = await UserDB.User.findOne({ id });
    user.permission = { ...body.permission };
    const status = await UserDB.User.updateOne({ id }, user);
    if (status && status.ok === 1) {
      console.log('User updated:', user);
      return await getUsers();
    } else {
      throw new Error('Ошибка изменения данных в БД');
    }
  } catch (error) {
    console.error(error);
    return false;
  }
};

module.exports.deleteUser = async (id) => {
  try {
    const findUser = await UserDB.User.findOne({ id });
    const status = await UserDB.User.deleteOne({ id });
    if (status && status.ok === 1) {
      if (findUser.image) {
        await unlink(path.join(process.cwd(), 'public', findUser.image));
      }
      console.log('User deleted:', status);
      return await getUsers();
    } else {
      throw new Error('Ошибка удаления из БД');
    }
  } catch (error) {
    console.error(error);
    return false;
  }
};

module.exports.updateProfile = (currentUser, req, res, next) => {
  const form = new formidable.IncomingForm();
  const upload = path.join('/public', 'assets', 'users');
  form.uploadDir = path.join(process.cwd(), upload);

  if (!fs.existsSync(form.uploadDir)) {
    fs.mkdirSync(form.uploadDir);
  } else {
    if (currentUser.image) {
      const oldAvatar = path.join(process.cwd(), '/public', currentUser.image);
      if (fs.existsSync(oldAvatar)) {
        fs.unlinkSync(oldAvatar);
      }
    }
  }

  form.parse(req, (err, fields, files) => {
    if (err) {
      return next(err);
    }

    const isValid = files.avatar && validateData(fields);

    if (isValid) {
      const fileName = path.join(upload, files.avatar.name);
      const newName = path.join(process.cwd(), fileName);
      fs.rename(files.avatar.path, newName, async (err) => {
        if (err) {
          console.error(err.message);
          return false;
        }

        const pathToImage = fileName.substr(fileName.indexOf('assets'));
        const password = fields.newPassword
          ? fields.newPassword
          : fields.oldPassword;

        try {
          const jimpedFile = await Jimp.read(newName);
          jimpedFile
            .cover(384, 384)
            .crop(0, 0, 384, 384)
            .quality(60)
            .write(newName);
          const updatedUser = {
            ...currentUser._doc,
            image: pathToImage,
            firstName: fields.firstName,
            surName: fields.surName,
            middleName: fields.middleName,
            password
          };
          const status = await UserDB.User.updateOne(
            { id: currentUser.id },
            updatedUser
          );

          currentUser._doc = { ...updatedUser };
          if (currentUser._doc.hasOwnProperty('password')) {
            delete currentUser._doc.password;
          }
          if (status && status.ok === 1) {
            console.log('User updated:', updatedUser);
            res.status(200).json(updatedUser);
            return true;
          } else {
            throw new Error('Ошибка изменения данных в БД');
          }
        } catch (error) {
          console.error(error);
          return false;
        }
      });
    } else {
      res.status(500).json({ message: 'Неверно заполнены данные' });
    }
  });
};
