const Expense = require('~models/Expense');

const controller = async (req, res) => {
  const { body, user } = req;
  const expense = await Expense.createPayment({
    ...body,
    createdBy: user.id,
  });
  return res.status(201).json(expense);
};

module.exports = controller;
