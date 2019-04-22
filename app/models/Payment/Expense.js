const mongoose = require('mongoose');
const Payment = require('./index.js');

const PaymentExpenseSchema = new mongoose.Schema({
  expense: { type: 'ObjectId', ref: 'Expense', required: true },
});

PaymentExpenseSchema.statics.createOne = async function (params) {
  const payment = await this.create(params);
  return payment;
};

module.exports = Payment.discriminator('expense', PaymentExpenseSchema);
