const mongoose = require('mongoose');
const Payment = require('./index.js');

const PaymentInvoiceSchema = new mongoose.Schema({
  invoice: { type: 'ObjectId', ref: 'Invoice', required: true },
});

PaymentInvoiceSchema.statics.createOne = async function (params) {
  const payment = await this.create(params);
  return payment;
};

module.exports = Payment.discriminator('invoice', PaymentInvoiceSchema);
