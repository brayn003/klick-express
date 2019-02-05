const mongoose = require('mongoose');
const Payment = require('./index.js');

const ExpensePaymentSchema = new mongoose.Schema({
  expense: { type: 'ObjectId', ref: 'Expense', required: true },
});
module.exports = Payment.discriminator('expense', ExpensePaymentSchema);
