const Organization = require('~models/Organization');

const controller = async (req, res) => {
  const { id } = req.params;
  await Organization.deleteById(id);
  return res.status(200).json({ success: true });
};

module.exports = controller;
