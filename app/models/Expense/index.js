const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate');

const { ValidationError } = require('~helpers/extended-errors');

const ExpenseSchema = new mongoose.Schema({
  // refs
  organization: { type: 'ObjectId', ref: 'Organization', required: true },
  category: { type: 'ObjectId', ref: 'ExpenseCategory', required: true },
  payments: [{ type: 'ObjectId', ref: 'Payment' }],

  expenseDate: { type: Date, required: true },
  dueDate: { type: 'ObjectId', default: null },

  title: { type: String, required: true },
  serial: { type: String, default: null },
  attachments: [{ type: String }],
  inlineComment: { type: String, default: '' },
  status: { type: String, enum: ['open', 'closed', 'cancelled'], default: 'open' },

  accountType: { type: String, enum: ['business', 'personal'], default: 'business' },
  taxInclusion: { type: String, enum: ['inclusive', 'exclusive'], default: 'exclusive' },

  taxableAmount: { type: Number, required: true },
  taxAmount: { type: Number, required: true },
  total: { type: Number, required: true },
  roundedTotal: { type: Number, required: true },
  taxes: [{
    taxType: { type: 'ObjectId', ref: 'TaxType' },
    amount: { type: Number, required: true },
  }],

  tdsRate: { type: Number, required: true },
  tdsAmount: { type: Number, required: true },
  amountPayable: { type: Number, required: true },
  roundedAmountPayable: { type: Number, required: true },
}, {
  collection: 'expense',
  timestamps: true,
  userAudits: true,
});

ExpenseSchema.statics.createOne = async function (params) {
  const { amount, tdsAmount, ...rest } = params;
  if (amount <= 0) {
    throw new ValidationError('Amount should be more than 0');
  }

  const expense = await this.create({
    ...rest,
    taxableAmount: amount,
    taxAmount: 0,
    total: amount,
    roundedTotal: Math.round(amount),
    taxes: [],
    tdsRate: ((tdsAmount / amount) * 100),
    tdsAmount,
    amountPayable: amount - tdsAmount,
    roundedAmountPayable: Math.round(amount - tdsAmount),
  });
  return expense;
};

ExpenseSchema.statics.updateExpense = async function (id, body) {
  const expense = await this.findByAndUpdate({ id, body });
  return expense;
};

ExpenseSchema.statics.getAll = async function (params) {
  const { title, user } = params;
  const criteria = {};
  if (title) criteria.title = { $regex: new RegExp(title, 'i') };
  if (user) {
    const roles = await this.model('OrganizationUser').find({ user });
    const expenseIds = roles.map(c => mongoose.Types.ObjectId(c.expense));
    criteria._id = { $in: expenseIds };
  }
  const expenses = await this.paginate(criteria, {
    lean: true,
    sort: { _id: -1 },
    populate: ['category', { path: 'createdBy', model: 'User' }],
  });
  return expenses;
};
ExpenseSchema.plugin(mongoosePaginate);
const Expense = mongoose.model('Expense', ExpenseSchema);
module.exports = Expense;
