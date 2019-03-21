const mongoose = require('mongoose');

const ExpenseCategorySchema = new mongoose.Schema({
  // refs
  organization: { type: 'ObjectId', ref: 'Organization', required: true },
  name: { type: String, required: true },
  description: { type: String },
});
const ExpenseCategory = mongoose.model('ExpenseCategory', ExpenseCategorySchema);
module.exports = ExpenseCategory;
