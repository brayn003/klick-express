const Admin = require('~models/Admin');

module.exports = (req, res, next) => {
  const { user } = req;
  if (!user) {
    return res.status(403).json({ messages: ['User is not authenticated'] });
  }
  const admin = Admin.find({ user: user.id });
  if (!admin) {
    return res.status(401).json({ messages: ['Not admin'] });
  }
  return next();
};
