const Expense = require('~models/Expense');

module.exports = async (req, res) => {
  const { body, user } = req;
  const expense = await Expense.createOne({ ...body, createdBy: user.id });
  return res.status(201).json(expense);
};
