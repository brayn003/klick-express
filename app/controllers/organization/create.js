const Organization = require('~models/Organization');
const OrganizationUser = require('~models/Organization/User');
const omit = require('lodash/omit');

const { transformError } = require('~/helpers/error-handlers');

module.exports = async (req, res) => {
  const { body, user } = req;

  let newBody = body;
  if (!user.admin) {
    newBody = omit(body, ['verified']);
  }

  try {
    const organization = await Organization.createOne(newBody, user.id);
    await OrganizationUser.createOne({
      user: user.id,
      organization: organization.id,
      role: 'owner',
    }, user.id);
    return res.status(201).json(organization);
  } catch (e) {
    return res.status(400).json(transformError(e));
  }
};
