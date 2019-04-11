const { verifyJWT } = require('~helpers/jwt-service');

module.exports = async (req, res) => {
  const { token } = req.body;
  await verifyJWT(token, process.env.ADMIN_AUTH_SECRET);
  res.json({ success: true });
};
