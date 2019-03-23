const Organization = require('~models/Organization');
const { transformError } = require('~helpers/error-handlers');

module.exports = async (req, res) => {
  try {
    const { query, user } = req;
    if (!user.admin && !query.user) {
      throw new Error('You dont have permission to see all organizations');
    }
    if (!user.admin && query.user !== user.id) {
      throw new Error('User token mismatch');
    }
    const organizations = await Organization.getAll(query);
    return res.status(200).json(organizations);
  } catch (err) {
    return res.status(400).json(transformError(err));
  }
};
