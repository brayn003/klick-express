const Organization = require('~models/Organization');

module.exports = async (req, res) => {
  const { params } = req;
  const { id } = params;
  const organization = await Organization.findById(id).populate({
    path: 'defaultBranch',
    populate: {
      path: 'state',
    },
  });
  return res.status(200).json(organization);
};
