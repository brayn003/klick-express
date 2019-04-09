const Invoice = require('~models/Invoice');

const controller = async (req, res) => {
  const { params } = req;
  const { id } = params;
  try {
    await Invoice.generatePDF(id);
    res.json({ success: true });
  } catch (e) {
    console.log(e);
    res.status(500).json({ success: false, messages: [e instanceof Error ? e.toString() : e] });
  }
};

module.exports = controller;
