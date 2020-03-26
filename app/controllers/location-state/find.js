const LocationState = require('~models/Location/State');

module.exports = async (req, res) => {
  const { query } = req;
  const states = await LocationState.getAll(query);
  return res.status(200).json(states);
};
