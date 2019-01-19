const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  invoice: { type: 'ObjectId', ref: 'Invoice' },
  paymentDate: { type: Date, required: true },
  amount: { type: Number, required: true },
  paymentMode: { type: String, enum: ['cash', 'chequw', 'card', 'bank'] },
}, {
  userAudits: true,
  timestamps: true,
  collection: 'invoice_payments',
});

module.exports = mongoose.model('invoice_payment', paymentSchema);
