const Invoice = require('~models/Invoice');
const { transformError } = require('~helpers/error-handlers');

const controller = async (req, res) => {
  const { user, query } = req;
  if (!user.admin && !query.organization) {
    return res
      .status(403)
      .json(transformError('You don\'t have permission to view all invoices', 'E_FORBIDDEN'));
  }
  const invoices = await Invoice.getAll(query);
  return res.json(invoices);
};

module.exports = controller;
