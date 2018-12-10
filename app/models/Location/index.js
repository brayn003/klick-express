const mongoose = require('mongoose');

const LocationSchema = new mongoose.Schema({
  name: { type: String, required: true },
  key: { type: String, required: true },
  type: { type: String, enum: ['state', 'city'] },
}, {
  collation: 'location',
  userAudits: true,
  timestamps: true,
  discriminatorKey: 'type',
});

module.exports = mongoose.model('Location', LocationSchema);
