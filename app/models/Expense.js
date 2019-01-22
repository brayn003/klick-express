const mongoose = require('mongoose');

const ExpenseSchema = new mongoose.Schema({
  // refs
  organization: { type: 'ObjectId', ref: 'Organization', required: true },
  category: { type: 'ObjectId', ref: 'ExpenseCategory', required: true },

  expenseDate: { type: Date, required: true },
  paymentDate: { type: Date },
  taxInclusion: { type: String, enum: ['inclusive', 'exclusive'], required: true },
  amountBeforeTax: { type: Number, required: true },
  amountAfterTax: { type: Number, required: true },
  taxRate: { type: Number, required: true },
  taxAmount: { type: Number, required: true },
  tdsAmount: { type: Number, required: true },
  amountPayable: { type: Number, required: true },
  accountType: { type: String, enum: ['business', 'personal'], default: 'business' },
  description: { type: String, required: true },
  paymentMode: { type: String, enum: ['cash', 'cheque', 'card', 'bank'], required: true },
  bill: { type: String },
}, {
  collection: 'expense',
  timestamps: true,
  userAudits: true,
});
const Expense = mongoose.model('Expense', ExpenseSchema);
module.exports = Expense;
