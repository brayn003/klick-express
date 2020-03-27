const { ForbiddenError } = require('~helpers/extended-errors');
const Invoice = require('~models/Invoice');
const mongoose = require('mongoose');

const controller = async (req, res) => {
  const { query, user } = req;
  if (!user.admin && !query.organization) {
    throw new ForbiddenError('You don\'t have access to access all invoices');
  }

  const $match = {
    status: { $in: ['open', 'closed'] },
    // data from 1 April 2019
    raisedDate: { $gte: new Date(1554057000000) },
    organization: query.organization,
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
      $lookup: {
        from: 'organization',
        localField: 'client',
        foreignField: '_id',
        as: 'client',
      },
    },
    {
      $project: {
        client: {
          $arrayElemAt: ['$client', 0],
        },
        received: { $sum: '$payments.amount' },
        remaining: { $subtract: ['$roundedAmountReceivable', { $sum: '$payments.amount' }] },
        total: '$roundedAmountReceivable',
      },
    },
    {
      $project: {
        client: {
          _id: '$client._id',
          name: '$client.name',
        },
        received: 1,
        remaining: 1,
        total: 1,
      },
    },
    {
      $group: {
        _id: null,
        received: { $sum: '$received' },
        remaining: { $sum: '$remaining' },
        total: { $sum: '$total' },
      },
    },
    {
      $project: {
        _id: 0,
        received: 1,
        remaining: 1,
        total: 1,
      },
    },
  ]);
  res.json(summary[0]);
};

module.exports = controller;
