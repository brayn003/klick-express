const omit = require('lodash/omit');

module.exports = async (req, res) => {
  const { user } = req;
  const newUser = omit(user, ['iat', 'exp']);
  return res.status(200).json(newUser);
};
