const Invoice = require('~models/Invoice');

const controller = async (req, res) => {
  const { params } = req;
  const invoice = await Invoice.getById(params.id);
  return res.status(200).json(invoice);
};

module.exports = controller;
