const { check } = require('express-validator/check');

const Invite = require('../../models/Invite');
const { validateParams } = require('../../helpers/validation-service');

const checks = [
  check('email').isEmail().withMessage('Not a valid email'),
];

async function controller(req, res) {
  const { email } = req.body;
  try {
    const invite = await Invite.create({ email });
    return res.status(201).json(invite.toJSON());
  } catch (e) {
    return res.status(400).json({ messages: [e instanceof Error ? e.toString() : e] });
  }
}

module.exports = validateParams(checks, controller);
