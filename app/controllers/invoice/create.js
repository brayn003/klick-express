const Invoice = require('~models/Invoice');

async function controller(req, res) {
  const { body, user } = req;
  const invoice = await Invoice.createOne({ ...body, createdBy: user.id });
  return res.status(201).json(invoice);
}

module.exports = controller;
