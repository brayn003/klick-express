const Organization = require('~models/Organization');

module.exports = async (req, res) => {
  const { query } = req;
  // if (!user.admin && !query.user) {
  //   throw new Error('You dont have permission to see all organizations');
  // }
  // if (!user.admin && query.user !== user.id) {
  //   throw new Error('User token mismatch');
  // }
  const organizations = await Organization.getAll(query);
  return res.status(200).json(organizations);
};
