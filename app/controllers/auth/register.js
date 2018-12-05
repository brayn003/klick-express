const { check } = require('express-validator/check');

const User = require('~models/User');
const Invite = require('~models/Invite');
const { validateParams } = require('~helpers/validation-service');
const { transformError } = require('~helpers/error-handlers');

const checks = [
  check('email').isEmail().withMessage('not a valid email'),
  check('password').isLength({ min: 5 }).withMessage('should be more than 5 chars'),
  check('code').exists(),
  check('name').exists(),
];

const controller = async (req, res) => {
  const { email, code, ...rest } = req.body;
  try {
    const inviteStatus = await Invite.useInvite(email, code);
    if (inviteStatus) {
      const user = await User.createUser({ email, ...rest });
      return res.status(201).json(user);
    }
    return res.status(400).json(transformError('Invalid invite code'));
  } catch (err) {
    return res.status(400).json(transformError(err));
  }
};

module.exports = [validateParams(checks), controller];
