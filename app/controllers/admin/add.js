const Admin = require('../../models/Admin');

module.exports = async (req, res) => {
  const { user } = req;
  const { userId } = req.body;
  try {
    const admin = await Admin.addAdmin(userId, user.id);
    return res.status(201).json(admin.toJSON({ virtuals: true }));
  } catch (e) {
    return res.status(401).json({ messages: [e instanceof Error ? e.toString() : e] });
  }
};
