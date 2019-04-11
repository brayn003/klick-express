const User = require('~models/User');
const Invite = require('~models/Invite');

const { ValidationError } = require('~helpers/extended-errors');

const controller = async (req, res) => {
  const { email, code, ...rest } = req.body;
  const inviteStatus = await Invite.useInvite(email, code);
  if (!inviteStatus) {
    throw new ValidationError('Invalid invite code');
  }
  const user = await User.createUser({ email, ...rest });
  return res.status(201).json(user);
};

module.exports = controller;
