const Invoice = require('~models/Invoice');

const controller = async (req, res) => {
  const { params } = req;
  const { id } = params;
  const view = await Invoice.generateHTML(id);
  return res.send(view);
};

module.exports = controller;
