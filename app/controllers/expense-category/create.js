const ExpenseCategory = require('~models/ExpenseCategory');

const controller = async (req, res) => {
  const { body, user } = req;
  const category = await ExpenseCategory.createOne({ ...body, createdBy: user.id });
  return res.json(category);
};

module.exports = controller;
