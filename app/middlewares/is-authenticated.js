const { verifyJWT } = require('~helpers/jwt-service');

module.exports = async (req, res, next) => {
  try {
    const token = (req.header('Authorization') || '').replace('Token ', '');
    const user = await verifyJWT(token, process.env.AUTH_SECRET);
    req.user = user;
    next();
  } catch (e) {
    res.status(400).json({ code: e.name, message: e.message });
  }
};
