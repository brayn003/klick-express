const Branch = require('~models/Organization/Branch');

module.exports = async (req, res) => {
  const { body, user } = req;
  const organization = await Branch.createOne({ ...body, createdBy: user.id });
  return res.status(201).json(organization);
};
