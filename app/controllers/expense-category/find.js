const ExpenseCategory = require('~models/Expense/Category');

const controller = async (req, res) => {
  const { query } = req;
  const categories = await ExpenseCategory.getAll(query);
  return res.json(categories);
};

module.exports = controller;
