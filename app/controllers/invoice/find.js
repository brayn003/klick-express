const Invoice = require('~models/Invoice');
const { ForbiddenError } = require('~helpers/extended-errors');

const controller = async (req, res) => {
  const { user, query } = req;
  if (!user.admin && !query.organization) {
    throw new ForbiddenError('You don\'t have access to access all invoices');
  }
  const invoices = await Invoice.getAll(query);
  return res.status(200).json(invoices);
};

module.exports = controller;
