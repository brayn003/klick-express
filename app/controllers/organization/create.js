const Organization = require('~models/Organization');

const { transformError } = require('~/helpers/error-handlers');

module.exports = async (req, res) => {
  const { body, user } = req;
  try {
    const organization = await Organization.createOrganization(body, user.id);
    return res.status(201).json(organization);
  } catch (e) {
    return res.status(400).json(transformError(e));
  }
};
