const Organization = require('~models/Organization');
const omit = require('lodash/omit');

module.exports = async (req, res) => {
  const { body, user } = req;
  let newBody = body;
  if (!user.admin) {
    newBody = omit(body, ['verified']);
  }
  const organization = await Organization.createOne({
    ...newBody,
    createdBy: user.id,
  });
  return res.status(201).json(organization);
};
