const Admin = require('~models/Admin');

module.exports = async (req, res) => {
  const admins = await Admin.getAdmins();
  return res.json(admins);
};
