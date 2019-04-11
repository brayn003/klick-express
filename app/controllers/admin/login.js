const Admin = require('~models/Admin');

async function controller(req, res) {
  const { email, password } = req.body;
  const token = await Admin.authenticate(email, password);
  return res.json({ token });
}

module.exports = controller;
