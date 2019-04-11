const Invite = require('~models/Invite');

const controller = async (req, res) => {
  const { user } = req;
  const { email } = req.body;
  const invite = await Invite.createInvite(email, user.id);
  return res.status(201).json(invite);
};

module.exports = controller;
