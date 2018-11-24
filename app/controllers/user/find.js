const pick = require('lodash/pick');

const User = require('~models/User');

module.exports = async (req, res) => {
  const { query } = req;
  const params = pick(query, ['email', 'name']);
  const users = await User.getUsers(params);
  return res.json(users);
};
