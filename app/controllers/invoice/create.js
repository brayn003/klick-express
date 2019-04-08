const { checkSchema } = require('express-validator/check');
const { validateParams } = require('~helpers/validation-service');
const InvoiceService = require('~helpers/invoice-service');
const Particular = require('~models/Particular');
const Branch = require('~models/Organization/Branch');
const Organization = require('~models/Organization');
const Invoice = require('~models/Invoice');

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
    organizationBranch: orgBranchId,
    raisedDate,
    generateSerial: bodyGenerateSerial = false,
    currency = 'INR',
    taxInclusion = 'inclusive',
    particulars: bodyParticulars,
    dueDate = null,
    isUnderLUT = false,
    clientBranch: clientBranchId = null,
    inlineComment = '',
    attachements = null,
    discountRate,
    discountAmount,
    tdsRate,
    tdsAmount,
  } = body;


  const particulars = await Particular.getOrAdd(bodyParticulars);
  const orgBranch = await Branch.getById(orgBranchId);
  const organization = await Organization.getById(orgBranch.organization);
  let clientBranch = {};
  if (clientBranchId) {
    clientBranch = await Branch.getById(clientBranchId);
  }

  let generateSerial = bodyGenerateSerial;
  if (organization.invoicePreferences.autoSerial) {
    generateSerial = true;
  }

  let serial = null;
  if (generateSerial) {
    serial = await Invoice.getNewSerial(organization, orgBranch);
  }

  const isTaxable = (
    !!orgBranch.gstNumber
    && !isUnderLUT
    && !organization.isUnderComposition
    && generateSerial
  );

  const invoiceInstance = new InvoiceService({
    particulars,
    isTaxable,
    isSameState: orgBranch === clientBranch,
    taxInclusion,
    discountAmount,
    discountRate,
    tdsRate,
    tdsAmount,
  });

  const invoice = await Invoice.create({
    organization: organization.id,
    organizationBranch: orgBranchId,
    client: clientBranch.organization,
    clientBranch: clientBranch.id,
    raisedDate,
    dueDate,
    isGSTCompliant: !!orgBranch.gstNumber,
    isUnderComposition: organization.isUnderComposition,
    isUnderLUT,
    isTaxable,
    currency,
    taxPerItem: organization.invoicePreferences.taxPerItem,
    includeQuantity: organization.invoicePreferences.includeQuantity,
    taxInclusion,
    serial,
    inlineComment,
    attachements,
    particulars: particulars.map(particular => ({
      details: particular.details.id,
      rate: particular.rate,
      quantity: particular.quantity,
      discountRate: invoiceInstance.getParticularDiscountRate(particular),
      discountAmount: invoiceInstance.getParticularDiscountAmount(particular),
      taxes: invoiceInstance.getParticularTaxes(particular),
      overallTaxRate: invoiceInstance.getParticularOverallTaxRate(particular),
      taxAmount: invoiceInstance.getParticularTaxAmount(particular),
      amount: invoiceInstance.getParticularAmount(particular),
      taxableAmount: invoiceInstance.getParticularTaxableAmount(particular),
      total: invoiceInstance.getParticularTotal(particular),
    })),
    discountRate,
    discountAmount: invoiceInstance.getInvoiceDiscountAmount(),
    taxes: invoiceInstance.getAggregatedParticularTaxes(),
    overallTaxRate: invoiceInstance.getOverallTaxRate(),
    taxAmount: invoiceInstance.getTaxAmount(),
    amount: invoiceInstance.getAmount(),
    taxableAmount: invoiceInstance.getTaxableAmount(),
    total: invoiceInstance.getTotal(),
    tdsRate: invoiceInstance.getTdsRate(),
    tdsAmount: invoiceInstance.getTdsAmount(),
    amountReceivable: invoiceInstance.getAmountReceivable(),
    roundedTotal: invoiceInstance.getRoundedTotal(),
    roundedAmountReceivable: invoiceInstance.getRoundedAmountReceivable(),
  });

  return res.status(201).json(invoice);
}

module.exports = [validateParams(schemaCheck), controller];
