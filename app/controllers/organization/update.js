const Organiztion = require('~models/Organization');

const controller = async (req, res) => {
  const { params, body } = req;
  const org = await Organiztion.patchOne(params.id, body);
  return res.status(200).json(org);
};

module.exports = controller;
