const TaxType = require('~models/TaxType');
const { transformError } = require('~helpers/error-handlers');
const mapValues = require('lodash/mapValues');

module.exports = async (req, res) => {
  const { query } = req;
  const modifiedQuery = mapValues(query, (val) => {
    if (val === 'true') return true;
    if (val === 'false') return false;
    return val;
  });
  const taxTypes = await TaxType.getAll(modifiedQuery);
  try {
    return res.status(200).json(taxTypes);
  } catch (err) {
    return res.status(400).json(transformError(err));
  }
};
