const mongoose = require('mongoose');

const ExpenseSchema = new mongoose.Schema({
  // refs
  organization: { type: 'ObjectId', ref: 'Organization', required: true },
  category: { type: 'ObjectId', ref: 'ExpenseCategory', required: true },

  title: { type: String, required: true },
  serial: { type: Boolean, default: null },
  expenseDate: { type: Date, required: true },
  taxInclusion: { type: String, enum: ['inclusive', 'exclusive'], required: true },
  taxableAmount: { type: Number, required: true },
  total: { type: Number, required: true },
  taxAmount: { type: Number, required: true },
  tdsAmount: { type: Number, required: true },
  tdsRate: { type: Number, required: true },
  amountPayable: { type: Number, required: true },
  accountType: { type: String, enum: ['business', 'personal'], default: 'business' },
  inlineComment: { type: String, required: true },
  attachments: [{ type: String }],
  taxes: [{
    taxType: { type: 'ObjectId', ref: 'TaxType' },
    amount: { type: Number, required: true },
  }],
}, {
  collection: 'expense',
  timestamps: true,
  userAudits: true,
});
const Expense = mongoose.model('Expense', ExpenseSchema);
module.exports = Expense;
