const mongoose = require('mongoose');
const { createJWT } = require('../helpers/jwt-service');

const InviteSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
  },
  token: {
    type: String,
    required: true,
    unique: true,
  },
  used: {
    type: Boolean,
    required: true,
    default: false,
  },
}, {
  collection: 'invite',
  validateBeforeSave: false,
});

InviteSchema.pre('save', async function (next) {
  const email = await this.constructor.findOne({ email: this.email });
  if (email) {
    throw new Error('Email already exists');
  }
  const token = await createJWT({ details: { email: this.email } }, process.env.INVITE_SECRET, { expiresIn: '1d' });
  this.token = token;
  return next();
});

module.exports = mongoose.model('Invite', InviteSchema);
