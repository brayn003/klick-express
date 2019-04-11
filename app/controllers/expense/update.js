const Expense = require('~models/Expense');

module.exports = async (req, res) => {
  const { body, params } = req;
  const { id } = params;
  const expense = await Expense.updateExpense(id, body);
  return res.status(201).json(expense);
};
