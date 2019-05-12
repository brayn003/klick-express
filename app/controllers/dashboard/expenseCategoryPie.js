const Expense = require('~models/Expense');
const ExpenseCategory = require('~models/Expense/Category');
const { ForbiddenError, ValidationError } = require('~helpers/extended-errors');
const mongoose = require('mongoose');

const controller = async (req, res) => {
  const { query, user } = req;
  if (!user.admin && !query.organization) {
    throw new ForbiddenError('You don\'t have access to access all invoices');
  }
  const now = new Date();
  const month = parseInt(query.month, 10) || now.getMonth() + 1;
  const year = parseInt(query.year, 10) || now.getFullYear();
  const $match = {};
  try {
    if (query.organization) $match.organization = mongoose.Types.ObjectId(query.organization);
    const allAggExpense = await Expense.aggregate([
      { $match },
      { $group: { _id: null, total: { $sum: '$amountPayable' } } },
    ]);
    const totalExpense = allAggExpense[0].total;
    const aggExpense = await Expense.aggregate([
      { $match },
      {
        $project: {
          category: '$category',
          month: { $month: '$expenseDate' },
          year: { $year: '$expenseDate' },
          inOther: { $lt: [{ $multiply: [{ $divide: ['$amountPayable', totalExpense] }, 100] }, 3] },
          amountPayable: '$amountPayable',
        },
      },
      { $match: { month, year } },
      {
        $group: {
          _id: '$category',
          category: { $first: '$category' },
          total: { $sum: '$amountPayable' },
        },
      },
    ]);
    const populatedAggExpense = await ExpenseCategory.populate(aggExpense, { path: 'category' });
    const data = populatedAggExpense.map(e => ({
      Name: e.category.name,
      Amount: e.total,
      Percent: e.percent,
    }));
    return res.json({
      data,
      labelKey: 'Name',
      valueKey: 'Amount',
      month: parseInt(month, 10),
      year: parseInt(year, 10),
    });
  } catch (err) {
    throw new ValidationError(err.errmsg);
  }
};

module.exports = controller;
