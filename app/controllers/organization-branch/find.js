const Branch = require('~models/Organization/Branch');

module.exports = async (req, res) => {
  const { query } = req;
  const branches = await Branch.getAll(query);
  return res.status(200).json(branches);
};
