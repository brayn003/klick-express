const { check } = require('express-validator/check');

const Admin = require('~models/Admin');
const { validateParams } = require('~helpers/validation-service');

const checks = [
  check('email').isEmail().withMessage('not a valid email'),
  check('password').isLength({ min: 5 }).withMessage('should be more than 5 chars'),
];

async function controller(req, res) {
  const { email, password } = req.body;
  const token = await Admin.authenticate(email, password);
  return res.json({ token });
}
module.exports = [validateParams(checks), controller];
