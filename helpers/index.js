module.exports.validateData = (obj) => {
  for (const item in obj) {
    if (obj.hasOwnProperty('newPassword')) {
      continue;
    }
    if (obj.hasOwnProperty(item)) {
      if (obj[item] === '') {
        return false;
      }
    }
  }
  return true;
};
