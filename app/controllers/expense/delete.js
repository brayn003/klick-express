const Expense = require('~models/Expense');

const controller = async (req, res) => {
  const { params, user } = req;
  await Expense.softDeleteById(params.id, user.id);
  return res.status(200).json({ deleted: true });
};

module.exports = controller;
