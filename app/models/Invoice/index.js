const mongoose = require('mongoose');
const keyBy = require('lodash/keyBy');
const Decimal = require('decimal.js');
const isNil = require('lodash/isNil');
const Particular = require('~models/Particular');
const OrganizationBranch = require('~models/Organization/Branch');
const Organization = require('~models/Organization');
const sumBy = require('lodash/sumBy');
const maxBy = require('lodash/maxBy');

const InvoiceSchema = new mongoose.Schema({
  // refs
  organization: { type: 'ObjectId', ref: 'Organization', required: true },
  organizationBranch: { type: 'ObjectId', ref: 'OrganizationBranch', required: true },
  client: { type: 'ObjectId', ref: 'Organization', required: true },
  clientBranch: { type: 'ObjectId', ref: 'OrganizationBranch' },

  // dates
  raisedDate: { type: Date, required: true },
  dueDate: { type: Date, default: null },
  cancelledDate: { type: Date, default: null },
  closedDate: { type: Date, default: null },

  // semaphore flags
  isGSTCompliant: { type: Boolean, required: true },
  isUnderComposition: { type: Boolean, default: false },
  isUnderLUT: { type: Boolean, default: false },
  generateSerial: { type: Boolean, required: true },
  isTaxable: { type: Boolean, required: true },

  // properties
  currency: { type: String, required: true },
  taxPerItem: { type: Boolean, required: true },
  taxInclusion: { type: String, enum: ['inclusive', 'exclusive'], required: true },
  serial: { type: Boolean, default: null },
  status: { type: String, enum: ['open', 'closed', 'cancelled'], default: 'open' },
  inlineComment: { type: String, required: true },
  attachments: [{ type: String }],

  particulars: [{
    details: { type: 'ObjectId', ref: 'InvoiceParticular' },
    rate: { type: Number, required: true },
    quantity: { type: Number, required: true },

    cgstRate: { type: Number, required: true },
    sgstRate: { type: Number, required: true },
    igstRate: { type: Number, required: true },
    cgstAmount: { type: Number, required: true },
    sgstAmount: { type: Number, required: true },
    igstAmount: { type: Number, required: true },

    // amount = rate * qty
    billAmount: { type: Number, required: true },
    discountField: { type: String, enum: ['rate', 'amount'], required: true },
    discountRate: { type: Number, default: 0 },
    discountAmount: { type: Number, default: 0 },
    taxableAmount: { type: Number, required: 0 },
    total: { type: Number, required: 0 },
  }],

  // original amount without anything
  billAmount: { type: Number, required: true },
  discountRate: { type: Number, required: true },
  discountAmount: { type: Number, required: true },

  // amount after deducting discount
  taxableAmount: { type: Number, required: true },

  cgstRate: { type: Number, default: null },
  sgstRate: { type: Number, default: null },
  igstRate: { type: Number, default: null },
  cgstAmount: { type: Number, default: null },
  sgstAmount: { type: Number, default: null },
  igstAmount: { type: Number, default: null },

  // amount after discount and tax
  grandTotal: { type: Number, required: true },
  roundedGrandTotal: { type: Number, required: true },

  tdsAmount: { type: Number, required: true },
  amountReceivable: { type: Number, required: true },

  // amount after tax, discount and receivable
  roundedAmountReceivable: { type: Number, required: true },

  payments: [{ type: 'ObjectId', ref: 'InvoicePayment' }],

}, {
  collection: 'invoice',
  timestamps: true,
  userAudits: true,
});

async function getSanitizedParticulars(particularBodies) {
  // creating particulars for non existent entries
  const newParticularBodies = particularBodies
    .filter(particular => !particular.details.id)
    .map(particular => particular.details);
  const newParticulars = await Particular.insertMany(newParticularBodies);

  // populating old entries
  const oldParticularIds = particularBodies
    .filter(particular => !!particular.details.id)
    .map(particular => particular.details.id);
  const oldParticulars = await Particular.find({ _id: { $in: oldParticularIds } });
  const oldParticularMap = keyBy(oldParticulars, 'id');

  // mapping all particulars
  const particulars = particularBodies.map((particular) => {
    if (particular.details && particular.details.id) {
      const particularDoc = oldParticularMap[particular.details.id];
      if (particularDoc) {
        return { ...particular, details: particularDoc };
      }
      throw new Error(`Cannot find particular ${particular.details.id}`);
    }
    return { ...particular, details: newParticulars.pop() };
  });

  return particulars;
}

function getComputedParticulars(particulars, options) {
  const { isTaxable, isSameState, taxInclusion } = options;
  return particulars.map((particular) => {
    const {
      discountRate, rate, quantity, details,
    } = particular;
    const taxRate = new Decimal(particular.taxRate);
    let { discountAmount } = particular;
    let discountField = 'amount';
    let cgstRate = 0;
    let sgstRate = 0;
    let igstRate = 0;
    let cgstAmount = 0;
    let sgstAmount = 0;
    let igstAmount = 0;
    let taxableAmount = 0;
    let total = 0;

    const billAmount = new Decimal(rate).mul(quantity);

    if (isTaxable) {
      if (isSameState) {
        cgstRate = taxRate.div(2);
        sgstRate = taxRate.div(2);
      } else {
        igstRate = taxRate;
      }
    }

    if (isNil(discountAmount)) {
      discountField = 'rate';
      discountAmount = billAmount.mul(discountRate).div(100);
    }

    if (taxInclusion === 'inclusive') {
      total = billAmount.sub(discountAmount);
      cgstAmount = total.mul(cgstRate).div(taxRate.add(100));
      sgstAmount = total.mul(sgstRate).div(taxRate.add(100));
      igstAmount = total.mul(igstRate).div(taxRate.add(100));
      taxableAmount = total.sub(cgstAmount).sub(sgstAmount).sub(igstAmount);
    } else {
      taxableAmount = billAmount.sub(discountAmount);
      cgstAmount = taxableAmount.mul(cgstRate).div(100);
      sgstAmount = taxableAmount.mul(sgstRate).div(100);
      igstAmount = taxableAmount.mul(igstRate).div(100);
      total = taxableAmount.add(cgstAmount).add(sgstAmount).add(igstAmount);
    }

    return {
      details,
      rate: new Decimal(rate).valueOf(),
      quantity: new Decimal(quantity).valueOf(),
      cgstRate: cgstRate.valueOf(),
      sgstRate: sgstRate.valueOf(),
      igstRate: igstRate.valueOf(),
      cgstAmount: cgstAmount.valueOf(),
      sgstAmount: sgstAmount.valueOf(),
      igstAmount: igstAmount.valueOf(),
      billAmount: billAmount.valueOf(),
      discountField,
      discountRate: new Decimal(discountRate).valueOf(),
      discountAmount: discountAmount.valueOf(),
      taxableAmount: taxableAmount.valueOf(),
      total: total.valueOf(),
    };
  });
}

InvoiceSchema.statics.createInvoice = async function (params) {
  const {
    particulars: rawParticulars,
    organizationBranch: organizationBranchId,
    client: clientId,
    clientBranch: clientBranchId,
    taxInclusion,
    generateSerial: generateSerialParam,
    discountRate,
  } = params;
  let { discountAmount } = params;

  const organizationBranch = await OrganizationBranch.findById(organizationBranchId).populate('state');
  const organization = await Organization.findById(organizationBranch.organization);

  const client = await Organization.findById(clientId);
  let clientBranch = null;
  let isSameState = true;
  if (clientBranchId) {
    clientBranch = await OrganizationBranch.findById(clientBranchId).populate('state');
    isSameState = organizationBranch.state.code === clientBranch.state.code;
  }

  const isGSTCompliant = !!organizationBranch.gstNumber && !!organization.panNumber;
  const { isUnderComposition, taxPerItem } = organization;
  const isUnderLUT = false;

  let generateSerial = false;
  if (organization.invoicePreferences.autoSerial) {
    generateSerial = generateSerialParam;
  }

  const isTaxable = isGSTCompliant && !isUnderComposition && !isUnderLUT && generateSerial;

  const uncomputedParticulars = await getSanitizedParticulars(rawParticulars);
  const particulars = getComputedParticulars(uncomputedParticulars, { isTaxable, isSameState, taxInclusion });


  let cgstRate = 0;
  let sgstRate = 0;
  let igstRate = 0;
  let cgstAmount = 0;
  let sgstAmount = 0;
  let igstAmount = 0;
  const grandTotal = 0;

  // const billAmount = new Decimal(sumBy(particulars, 'billAmount')).toDP(2);
  const billAmount = new Decimal(sumBy(particulars, 'taxableAmount')).toDP(2);

  let discountField = 'amount';
  if (isNil(discountAmount)) {
    discountField = 'rate';
    discountAmount = billAmount.mul(discountRate).div(100);
  }
  const taxableAmount = billAmount.sub(discountAmount);
  if (taxPerItem) {
    cgstRate = null;
    sgstRate = null;
    igstRate = null;
    cgstAmount = null;
    sgstAmount = null;
    igstAmount = null;
  } else {
    cgstRate = maxBy(particulars, 'cgstRate');
    sgstRate = maxBy(particulars, 'sgstRate');
    igstRate = maxBy(particulars, 'igstRate');
    cgstAmount = sumBy(particulars, 'cgstAmount');
    sgstAmount = sumBy(particulars, 'sgstAmount');
    igstAmount = sumBy(particulars, 'igstAmount');
  }
};

module.exports = mongoose.model('Invoice', InvoiceSchema);
