const TaxType = require('~models/TaxType');
const mapValues = require('lodash/mapValues');

module.exports = async (req, res) => {
  const { query } = req;
  const modifiedQuery = mapValues(query, (val) => {
    if (val === 'true') return true;
    if (val === 'false') return false;
    return val;
  });
  const taxTypes = await TaxType.getAll(modifiedQuery);
  return res.status(200).json(taxTypes);
};
