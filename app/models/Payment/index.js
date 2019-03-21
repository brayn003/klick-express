const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  paymentDate: { type: Date, required: true },
  amount: { type: Number, required: true },
  paymentMode: { type: String, enum: ['cash', 'cheque', 'card', 'bank'] },
  type: { type: String, enum: ['invoice', 'expense'] },
}, {
  userAudits: true,
  timestamps: true,
  collection: 'payment',
  discriminatorKey: 'type',
});

module.exports = mongoose.model('Payment', paymentSchema);
