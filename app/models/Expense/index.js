const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate');

const ExpenseSchema = new mongoose.Schema({
  // refs
  organization: { type: 'ObjectId', ref: 'Organization', required: true },
  category: { type: 'ObjectId', ref: 'ExpenseCategory', required: true },
  payments: [{ type: 'ObjectId', ref: 'Payment' }],

  title: { type: String, required: true },
  serial: { type: String, default: null },
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

ExpenseSchema.statics.createExpense = async function (params, createdBy) {
  const expense = await this.create({ ...params, createdBy });
  return expense.toJSON({ virtuals: true });
};

ExpenseSchema.statics.updateExpense = async function (id, body) {
  const expense = await this.findByAndUpdate({ id, body });
  return expense.toJSON({ virtuals: true });
};

ExpenseSchema.statics.getAll = async function (params) {
  const { name, user } = params;
  const criteria = {};
  if (name) criteria.name = { $regex: new RegExp(name, 'i') };
  if (user) {
    const roles = await this.model('OrganizationUser').find({ user });
    const expenseIds = roles.map(c => mongoose.Types.ObjectId(c.expense));
    criteria._id = { $in: expenseIds };
  }
  const expenses = await this.paginate(criteria, { lean: true });
  return expenses;
};
ExpenseSchema.plugin(mongoosePaginate);
const Expense = mongoose.model('Expense', ExpenseSchema);
module.exports = Expense;
