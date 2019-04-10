const ExpenseCategory = require('~models/ExpenseCategory');

const controller = async (req, res) => {
  const { query } = req;
  const categories = await ExpenseCategory.getAll(query);
  res.json(categories);
};

module.exports = controller;
