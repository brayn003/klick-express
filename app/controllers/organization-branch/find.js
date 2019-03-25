const Branch = require('~models/Organization/Branch');
const { transformError } = require('~helpers/error-handlers');

module.exports = async (req, res) => {
  try {
    const { query } = req;
    const branches = await Branch.getAll(query);
    return res.status(200).json(branches);
  } catch (err) {
    return res.status(400).json(transformError(err));
  }
};
