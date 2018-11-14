const mongoose = require('mongoose');

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
}, { collection: 'invite' });

module.exports = mongoose.model('Invite', InviteSchema);
