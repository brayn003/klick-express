const { checkSchema } = require('express-validator/check');
const { validateParams } = require('~helpers/validation-service');

const schemaCheck = checkSchema({
  organizationBranch: { isMongoId: true },
  raisedDate: { isISO8601: true },
  generateSerial: { isBoolean: true, optional: true },
  currency: { isIn: { options: [['INR']] }, optional: true },
  taxInclusion: { isIn: { options: [['inclusive', 'exclusive']] }, optional: true },
  particulars: { exists: true },
  'particulars.*.details': {
    custom: {
      options: (value) => {
        if (typeof value === 'string') {
          return true;
        }
        if (typeof value === 'object') {
          return true;
        }
        return false;
      },
    },
  },
  'particulars.*.rate': { isNumeric: true },
  'particulars.*.quantity': { isNumeric: true },
  'particulars.*.discountRate': { isNumeric: true, optional: true },
  'particulars.*.discountAmount': { isNumeric: true, optional: true },
  'particulars.*.taxTypes.*': { isMongoId: true },
  dueDate: { isISO8601: true, optional: true },
  isUnderLUT: { isBoolean: true, optional: true },
  clientBranch: { isMongoId: true, optional: true },
  inlineComment: { isString: true, optional: true },
  attachements: { optional: true },
  'attachements.*': { isURL: true },
  discountRate: { isNumeric: true, optional: true },
  discountAmount: { isNumeric: true, optional: true },
  tdsRate: { isNumeric: true, optional: true },
  tdsAmount: { isNumeric: true, optional: true },
});
async function controller(req, res) {
  const { body } = req;
  const {
    organizationBranch,
    raisedDate,
    generateSerial = false,
    currency = 'INR',
    taxInclusion = 'inclusive',
    particulars,
    dueDate = null,
    isUnderLUT = false,
    clientBranch = null,
    inlineComment = '',
    attachements = null,
    discountRate = 0,
    discountAmount = 0,
    tdsRate = 0,
    tdsAmount = 0,
  } = body;

  console.log(body);
  return res.status(201).json({ success: true });
}

module.exports = [validateParams(schemaCheck), controller];
