const { verifyJWT } = require('../helpers/jwt-service');

module.exports = async (req, res, next) => {
  const token = req.header('Authorization').replace('Token ', '');
  const decodedData = verifyJWT(token);
  try {
    req.user = decodedData;
    next();
  } catch (e) {
    res.status(400).json({ code: e.name, message: e.message });
  }
};
