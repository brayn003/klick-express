const Admin = require('~models/Admin');

module.exports = async (req, res) => {
  try {
    const admins = await Admin.getAdmins();
    return res.json(admins);
  } catch (e) {
    return res.status(401).json({ messages: [e instanceof Error ? e.toString() : e] });
  }
};
