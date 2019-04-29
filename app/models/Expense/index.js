const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate');
const sumBy = require('lodash/sumBy');

const { ValidationError, MissingError } = require('~helpers/extended-errors');
const PaymentExpense = require('~models/Payment/Expense');
const ExpenseService = require('~helpers/expense-service');

const ExpenseSchema = new mongoose.Schema({
  // refs
  organization: { type: 'ObjectId', ref: 'Organization', required: true },
  category: { type: 'ObjectId', ref: 'ExpenseCategory', required: true },
  payments: [{ type: 'ObjectId', ref: 'Payment' }],

  expenseDate: { type: Date, required: true },
  dueDate: { type: Date, default: null },

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

ExpenseSchema.statics.getById = async function (id) {
  const expense = await this.findById(id)
    .populate('organization')
    .populate('category')
    .populate('payments')
    .populate('taxes.taxType');
  return expense;
};

ExpenseSchema.statics.getAll = async function (params) {
  const {
    title, user, organization, page = 1,
  } = params;
  const criteria = {};
  if (title) criteria.title = { $regex: new RegExp(title, 'i') };
  if (user) {
    const roles = await this.model('OrganizationUser').find({ user });
    const expenseIds = roles.map(c => mongoose.Types.ObjectId(c.expense));
    criteria._id = { $in: expenseIds };
  }
  if (organization) criteria.organization = organization;
  const expenses = await this.paginate(criteria, {
    lean: true,
    sort: { _id: -1 },
    populate: [
      'category',
      { path: 'createdBy', model: 'User' },
      'payments',
    ],
    page: parseInt(page, 10),
  });
  return expenses;
};

ExpenseSchema.statics.createOne = async function (params) {
  const expenseInstance = new ExpenseService(params);
  const expense = await this.create(expenseInstance.getModeledData());
  return expense;
};

ExpenseSchema.statics.patchOne = async function (id, params) {
  const expenseInstance = new ExpenseService(params);
  const updateSet = expenseInstance.getModeledData();

  // payment crosses amount validation
  const oldExpense = await this.getById(id);
  if (!oldExpense) throw new MissingError('Expense does not exist');
  const paymentAmountDone = Math.round(sumBy(oldExpense.payments, 'amount'));
  if (updateSet.roundedAmountPayable < paymentAmountDone) throw new Error('Payments cannot exceed the amount');
  else if (updateSet.roundedAmountPayable > paymentAmountDone) updateSet.status = 'open';
  else updateSet.status = 'closed';

  await this.updateOne({ _id: id }, { $set: updateSet });
  const expense = await this.getById(id);
  return expense;
};

ExpenseSchema.statics.createPayment = async function (params) {
  if (params.amount < 0) throw new ValidationError('Amount cannot be less than 0');
  if (!params.expense) throw new ValidationError('Need to provide an expense id');
  const oldExpense = await this.getById(params.expense);
  if (!oldExpense) throw new MissingError('Expense does not exist');
  const paymentAmountDone = Math.round(sumBy(oldExpense.payments, 'amount'));
  const paymentRemaining = oldExpense.roundedAmountPayable - paymentAmountDone;
  if (params.amount > paymentRemaining) throw new ValidationError('Cannot pay more than the remaining value');
  const paymentExpense = await PaymentExpense.createOne(params);
  const updateSet = {};
  if (params.amount === paymentRemaining) updateSet.status = 'closed';
  await this.updateOne({ _id: params.expense }, {
    $push: { payments: paymentExpense.id },
    $set: updateSet,
  });
  const expense = await this.getById(params.expense);
  return expense;
};

ExpenseSchema.plugin(mongoosePaginate);

const Expense = mongoose.model('Expense', ExpenseSchema);

module.exports = Expense;
