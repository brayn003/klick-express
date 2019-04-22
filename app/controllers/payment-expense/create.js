const PaymentExpense = require('~models/Payment/Expense');
const { ValidationError } = require('~helpers/extended-errors');

const controller = async (req, res) => {
  const { body, user } = req;
  if (body.amount < 0) {
    throw new ValidationError('Amount cannot be less than 0');
  }
  const paymentExpense = await PaymentExpense.createOne({
    body,
    createdBy: user.id,
  });
  return res.status(201).json(paymentExpense);
};

module.exports = controller;
