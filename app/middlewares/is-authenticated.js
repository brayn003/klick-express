const { verifyJWT } = require('../helpers/jwt-service');

module.exports = async (req, res, next) => {
  try {
    const token = (req.header('Authorization') || '').replace('Token ', '');
    const decodedData = await verifyJWT(token, process.env.AUTH_SECRET);
    req.user = decodedData;
    next();
  } catch (e) {
    res.status(400).json({ code: e.name, message: e.message });
  }
};
