const Expense = require('~models/Expense');
const { transformError } = require('~/helpers/error-handlers');

module.exports = async (req, res) => {
  const { body, user } = req;
  try {
    const expense = await Expense.createExpense(body, user.id);
    return res.status(201).json(expense);
  } catch (e) {
    return res.status(400).json(transformError(e));
  }
};
