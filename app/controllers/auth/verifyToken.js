const { verifyJWT } = require('~helpers/jwt-service');

async function controller(req, res) {
  const { token } = req.body;
  const response = await verifyJWT(token, process.env.AUTH_SECRET);
  if (response) {
    return res.json({ verified: true });
  }
  return res.json({ verified: false });
}

module.exports = controller;
