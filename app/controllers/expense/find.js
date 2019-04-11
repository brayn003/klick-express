const Expense = require('~models/Expense');

module.exports = async (req, res) => {
  const { query } = req;
  const expenses = await Expense.getAll(query);
  return res.status(200).json(expenses);
};
