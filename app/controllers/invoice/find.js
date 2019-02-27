const Invoice = require('~models/Invoice');

const controller = async (req, res) => {
  const { query } = req;
  const invoices = await Invoice.getAll(query);
  return res.json(invoices);
};

module.exports = controller;
