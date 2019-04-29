const Expense = require('~models/Expense');

module.exports = async (req, res) => {
  const { body, params } = req;
  const { id } = params;
  const expense = await Expense.patchOne(id, body);
  return res.status(200).json(expense);
};
