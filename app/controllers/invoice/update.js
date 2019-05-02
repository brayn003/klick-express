const Invoice = require('~models/Invoice');

const controller = async (req, res) => {
  const { params, body, user } = req;
  const invoice = await Invoice.patchOne(params.id, { ...body, updatedBy: user.id });
  return res.status(200).json(invoice);
};

module.exports = controller;
