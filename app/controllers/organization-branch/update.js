const Branch = require('~models/Organization/Branch');

module.exports = async (req, res) => {
  const { params, body, user } = req;
  const { id } = params;
  const branch = await Branch.patchOne(id, {
    ...body,
    updatedBy: user.id,
  });
  return res.status(201).json(branch);
};
