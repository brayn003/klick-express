const { check } = require('express-validator/check');

const { validateParams } = require('~helpers/validation-service');
const { verifyJWT } = require('~helpers/jwt-service');

const checks = [
  check('token').exists(),
];

async function controller(req, res) {
  const { token } = req.body;
  try {
    const response = await verifyJWT(token, process.env.AUTH_SECRET);
    if (response) {
      return res.json({ verified: true });
    }
    return res.json({ verified: false });
  } catch (e) {
    return res.status(401).json({ messages: [e instanceof Error ? e.toString() : e] });
  }
}

module.exports = [validateParams(checks), controller];
