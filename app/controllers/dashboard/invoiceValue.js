const mongoose = require('mongoose');

const Invoice = require('~models/Invoice');
const { ForbiddenError } = require('~helpers/extended-errors');


const controller = async (req, res) => {
  const { query, user } = req;
  if (!user.admin && !query.organization) {
    throw new ForbiddenError('You don\'t have access to access all invoices');
  }
  const $match = {
    status: { $in: ['open', 'closed'] },
    // data from 1 April 2019
    raisedDate: { $gte: new Date(1554057000000) },
  };
  if (query.organization) $match.organization = mongoose.Types.ObjectId(query.organization);

  const summary = await Invoice.aggregate([
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
        total: '$taxableAmount',
      },
    },
    {
      $group: {
        _id: null,
        total: { $sum: '$total' },
      },
    },
    {
      $project: {
        _id: 0,
        total: 1,
      },
    },
  ]);

  res.json({
    totalTaxableAmount: +summary[0].total.toFixed(2),
  });
};

module.exports = controller;
