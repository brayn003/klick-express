const Branch = require('~models/Organization/Branch');

module.exports = async (req, res) => {
  const { params } = req;
  const { id } = params;
  const branch = await Branch.findById(id).populate('state');
  return res.status(200).json(branch);
};
