const Expense = require('~models/Expense');
const { transformError } = require('~helpers/error-handlers');

module.exports = async (req, res) => {
  const { query } = req;
  try {
    const expenses = await Expense.getAll(query);
    return res.status(200).json(expenses);
  } catch (err) {
    return res.status(400).json(transformError(err));
  }
};
