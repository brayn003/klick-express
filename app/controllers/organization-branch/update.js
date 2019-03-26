const Branch = require('~models/Organization/Branch');
const { transformError } = require('~/helpers/error-handlers');

module.exports = async (req, res) => {
  const { params, body, user } = req;
  const { id } = params;
  try {
    const branch = await Branch.patchOne(id, {
      ...body,
      updatedBy: user.id,
    });
    return res.status(201).json(branch);
  } catch (e) {
    return res.status(400).json(transformError(e));
  }
};
