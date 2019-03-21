const mongoose = require('mongoose');
const Payment = require('./index.js');

const InvoicePaymentSchema = new mongoose.Schema({
  invoice: { type: 'ObjectId', ref: 'Invoice', required: true },
});
module.exports = Payment.discriminator('invoice', InvoicePaymentSchema);
