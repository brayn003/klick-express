const User = require('~models/User');

async function controller(req, res) {
  const { email, password } = req.body;
  const token = await User.authenticate(email, password);
  return res.json({ token });
}

module.exports = controller;
