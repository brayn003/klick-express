const Invoice = require('~models/Invoice');

const controller = async (req, res) => {
  const { body, user } = req;
  const invoice = await Invoice.createPayment({
    ...body,
    createdBy: user.id,
  });
  return res.status(201).json(invoice);
};

module.exports = controller;
