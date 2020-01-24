const mongoose = require('mongoose');

const Invoice = require('~models/Invoice');
const Expense = require('~models/Expense');
const { ForbiddenError, ValidationError } = require('~helpers/extended-errors');


const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const controller = async (req, res) => {
  const { query, user } = req;
  if (!user.admin && !query.organization) {
    throw new ForbiddenError('You don\'t have access to access all invoices');
  }

  const now = new Date();
  const month = parseInt(query.month, 10) || now.getMonth() + 1;
  const year = parseInt(query.year, 10) || now.getFullYear();
  const $match = {};
  if (query.organization) $match.organization = mongoose.Types.ObjectId(query.organization);
  let aggIncoming = [];
  let aggOutgoing = [];
  try {
    aggIncoming = await Invoice.aggregate([
      { $match },
      {
        $lookup: {
          from: 'payment',
          localField: '_id',
          foreignField: 'invoice',
          as: 'payments',
        },
      },
      {
        $project: {
          month: { $month: '$raisedDate' },
          year: { $year: '$raisedDate' },
          received: { $sum: '$payments.amount' },
          remaining: { $subtract: ['$roundedAmountReceivable', { $sum: '$payments.amount' }] },
          total: '$roundedAmountReceivable',
        },
      },
      {
        $group: {
          _id: {
            month: '$month',
            year: '$year',
          },
          received: { $sum: '$received' },
          remaining: { $sum: '$remaining' },
          total: { $sum: '$total' },
        },
      },
    ]);
    aggOutgoing = await Expense.aggregate([
      { $match },
      {
        $lookup: {
          from: 'payment',
          localField: '_id',
          foreignField: 'invoice',
          as: 'payments',
        },
      },
      {
        $project: {
          month: { $month: '$expenseDate' },
          year: { $year: '$expenseDate' },
          paid: { $sum: '$payments.amount' },
          remaining: { $subtract: ['$roundedAmountPayable', { $sum: '$payments.amount' }] },
          total: '$roundedAmountPayable',
        },
      },
      {
        $group: {
          _id: {
            month: '$month',
            year: '$year',
          },
          paid: { $sum: '$paid' },
          remaining: { $sum: '$remaining' },
          total: { $sum: '$total' },
        },
      },
    ]);
  } catch (err) {
    throw new ValidationError(err.errmsg);
  }

  const expectedPeriods = [{ month, year }];
  if (month === 1) {
    expectedPeriods.push({ month: 12, year: year - 1 });
    expectedPeriods.push({ month: 11, year: year - 1 });
  } else if (month === 2) {
    expectedPeriods.push({ month: 1, year });
    expectedPeriods.push({ month: 12, year: year - 1 });
  } else {
    expectedPeriods.push({ month: month - 1, year });
    expectedPeriods.push({ month: month - 2, year });
  }

  // FUCKED UP CODE
  const data = aggIncoming
    // .sort((a, b) => ((b.year * 100) + b.month) - ((a.year * 100) + a.month))
    .filter(({ _id: inc }) => (
      !!expectedPeriods.find(p => ((p.month === inc.month) && (p.year === inc.year)))
    ))
    .map(inc => ({
      Month: `${months[inc.month - 1]} ${inc.year}`,
      // Amount: inc.
    }));

  return res.status(200).json({
    month,
    year,
    valueKey: 'Amount',
    labelKey: 'Month',
    groupKey: 'Type',
    stackBy: 'Status',
    data,
  });
};

module.exports = controller;
