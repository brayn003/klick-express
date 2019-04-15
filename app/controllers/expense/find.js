const Expense = require('~models/Expense');
const { ForbiddenError } = require('~helpers/extended-errors');

module.exports = async (req, res) => {
  const { user, query } = req;
  if (!user.admin && !query.organization) {
    throw new ForbiddenError('You don\'t have access to all the expenses');
  }
  const expenses = await Expense.getAll(query);
  return res.status(200).json(expenses);
};
