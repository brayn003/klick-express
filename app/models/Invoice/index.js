const mongoose = require('mongoose');
const InvoiceService = require('~helpers/invoice-service');
const { validateParticulars } = require('~helpers/tax-service');
const TaxType = require('~models/TaxType');

const InvoiceSchema = new mongoose.Schema({
  // refs
  organization: { type: 'ObjectId', ref: 'Organization', required: true },
  organizationBranch: { type: 'ObjectId', ref: 'OrganizationBranch', required: true },
  client: { type: 'ObjectId', ref: 'Organization', required: true },
  clientBranch: { type: 'ObjectId', ref: 'OrganizationBranch' },
  payments: [{ type: 'ObjectId', ref: 'Payment' }],

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

    discountRate: { type: Number, required: true },
    discountAmount: { type: Number, required: true },

    taxes: [{
      taxType: { type: 'ObjectId', ref: 'TaxType' },
      amount: { type: Number, required: true },
    }],
    overallTaxRate: { type: Number, required: true },
    taxAmount: { type: Number, required: true },

    amount: { type: Number, required: true },
    taxableAmount: { type: Number, required: true },
    total: { type: Number, required: true },
  }],

  taxes: [{
    taxType: { type: 'ObjectId', ref: 'TaxType' },
    amount: { type: Number, required: true },
  }],
  overallTaxRate: { type: Number, required: true },
  taxAmount: { type: Number, required: true },

  // amount before discounts/commissions and taxes
  amount: { type: Number, required: true },
  // amount before discounts/commissions, on which tax needs to applied
  taxableAmount: { type: Number, required: true },
  // grand total after discount and commission
  total: { type: Number, required: true },

  tdsRate: { type: Number, required: true },
  tdsAmount: { type: Number, required: true },
  amountReceivable: { type: Number, required: true },

  roundedTotal: { type: Number, required: true },
  roundedAmountReceivable: { type: Number, required: true },

}, {
  collection: 'invoice',
  timestamps: true,
  userAudits: true,
});

const particularsSeed = [{
  rate: 118,
  quantity: 1,
  discountAmount: 9,
  taxTypes: ['5c43969be05315f9d3a67b09', '5c43969be05315f9d3a67b0e'],
}];

async function getPopulatedParticulars(particulars) {
  const taxTypesArr = await Promise.all(
    particulars.map(async (p) => {
      const taxTypes = await TaxType.find({ _id: { $in: p.taxTypes } });
      return taxTypes;
    }),
  );
  return particulars.map((p, index) => {
    const taxTypes = taxTypesArr[index];
    return { ...p, taxTypes };
  });
}

InvoiceSchema.statics.createInvoice = async function ({
  particulars = particularsSeed,
  isTaxable = true,
  isSameState = true,
  discountAmount = 9,
}) {
  const newParticulars = await getPopulatedParticulars(particulars);
  validateParticulars(newParticulars, { isSameState, isTaxable });

  const invoice = new InvoiceService({
    particulars: newParticulars,
    isTaxable,
    isSameState,
    discountAmount,
    taxInclusion: 'inclusive',
  });
  // console.log('particulars -> ', invoice.particulars);
  console.log('Amount ->         ', invoice.getAmount());
  console.log('DiscountAmount -> ', -invoice.getTotalDiscountAmount());
  console.log('TaxableAmount ->  ', invoice.getTaxableAmount());
  console.log('Tax Amount ->     ', invoice.getTaxAmount());
  console.log('Grand Total ->    ', invoice.getTotal());
};

module.exports = mongoose.model('Invoice', InvoiceSchema);
