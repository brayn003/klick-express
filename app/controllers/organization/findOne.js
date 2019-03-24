const Organization = require('~models/Organization');

module.exports = async (req, res) => {
  const { params } = req;
  const { id } = params;
  const organization = await Organization.findById(id);
  return res.status(200).json(organization.toJSON({ virtuals: true }));
};
