const Expense = require('~models/Expense');
const { transformError } = require('~/helpers/error-handlers');

module.exports = async (req, res) => {
  const { body, params } = req;
  const { id } = params;
  try {
    const expense = await Expense.updateExpense(id, body);
    return res.status(201).json(expense);
  } catch (e) {
    return res.status(400).json(transformError(e));
  }
};
