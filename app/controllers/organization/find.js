const Organization = require('~models/Organization');
const { transformError } = require('~helpers/error-handlers');

module.exports = async (req, res) => {
  const { query } = req;
  try {
    const organizations = await Organization.getAll(query);
    return res.status(200).json(organizations);
  } catch (err) {
    return res.status(400).json(transformError(err));
  }
};
