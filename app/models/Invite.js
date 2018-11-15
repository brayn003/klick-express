const mongoose = require('mongoose');

const { createJWT } = require('../helpers/jwt-service');
const { mail } = require('../helpers/mail-service');

const InviteSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
  },
  code: {
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
  userAudits: true,
  timestamps: true,
});

InviteSchema.statics.createInvite = async function (email, createdBy = null) {
  const invite = await this.create({ email, createdBy });
  // await invite.mailInvite();
  return invite;
};

InviteSchema.methods.mailInvite = async function () {
  try {
    await mail({
      from: 'no-reply@klickconsulting.in',
      to: { email: this.email },
      subject: 'Invitation to join - Klick Consulting',
      templateId: 'd-2af391c403a6428ea3541123f4cfee34',
      dynamic_template_data: {
        url: `https://klickconsulting.in/${this.code}`,
      },
    });
    return true;
  } catch (e) {
    return false;
  }
};


InviteSchema.pre('save', async function (next) {
  const email = await this.constructor.findOne({ email: this.email });
  if (email) {
    throw new Error('Email already exists');
  }
  const code = await createJWT({ details: { email: this.email } }, process.env.INVITE_SECRET, { expiresIn: '1d' });
  this.code = code;
  return next();
});

module.exports = mongoose.model('Invite', InviteSchema);
