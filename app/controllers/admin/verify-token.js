const { verifyJWT } = require('~helpers/jwt-service');

module.exports = async (req, res) => {
  try {
    const { token } = req.body;
    await verifyJWT(token, process.env.ADMIN_AUTH_SECRET);
    res.json({ success: true });
  } catch (e) {
    res.status(400).json({ code: e.name, message: e.message });
  }
};
