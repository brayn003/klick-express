const Branch = require('~models/Organization/Branch');

const { transformError } = require('~/helpers/error-handlers');

module.exports = async (req, res) => {
  const { body, user } = req;

  try {
    const organization = await Branch.createOne(body, user.id);
    return res.status(201).json(organization);
  } catch (e) {
    return res.status(400).json(transformError(e));
  }
};
