const Invoice = require('~models/Invoice');

const controller = async (req, res) => {
  const { params } = req;
  const { id } = params;
  await Invoice.generatePDF(id);
  return res.json({ success: true });
};

module.exports = controller;
