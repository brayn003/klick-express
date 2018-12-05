const { check } = require('express-validator/check');

const User = require('../../models/User');
const { validateParams } = require('../../helpers/validation-service');

const checks = [
  check('email').isEmail().withMessage('not a valid email'),
  check('password').isLength({ min: 5 }).withMessage('should be more than 5 chars'),
];

async function controller(req, res) {
  const { email, password } = req.body;
  try {
    const token = await User.authenticate(email, password);
    return res.json({ token });
  } catch (e) {
    return res.status(401).json({ messages: [e instanceof Error ? e.toString() : e] });
  }
}

module.exports = [validateParams(checks), controller];
