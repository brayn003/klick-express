const Expense = require('~models/Expense');

const controller = async (req, res) => {
  const { params } = req;
  const expense = await Expense.getById(params.id);
  return res.status(200).json(expense);
};

module.exports = controller;
