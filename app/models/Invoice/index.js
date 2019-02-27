const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate');
// const Particular = require('~models/Particular');
// const InvoiceService = require('~helpers/invoice-service');
// const { validateParticulars } = require('~helpers/tax-service');
// const TaxType = require('~models/TaxType');

const InvoiceParticularSchema = new mongoose.Schema({
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
});

const InvoiceSchema = new mongoose.Schema({
  // refs
  organization: { type: 'ObjectId', ref: 'Organization', required: true },
  organizationBranch: { type: 'ObjectId', ref: 'OrganizationBranch', required: true },
  client: { type: 'ObjectId', ref: 'Organization' },
  clientBranch: { type: 'ObjectId', ref: 'OrganizationBranch' },

  // dates
  raisedDate: { type: Date, required: true },
  dueDate: { type: Date, default: null },
  cancelledDate: { type: Date, default: null },
  closedDate: { type: Date, default: null },

  // semaphore flags
  // generateSerial: { type: Boolean, required: true },
  isGSTCompliant: { type: Boolean, required: true },
  isUnderComposition: { type: Boolean, default: false },
  isUnderLUT: { type: Boolean, default: false },
  isTaxable: { type: Boolean, required: true },

  // properties
  currency: { type: String, required: true },
  taxPerItem: { type: Boolean, required: true },
  taxInclusion: { type: String, enum: ['inclusive', 'exclusive'], required: true },
  serial: { type: Boolean, default: null },
  status: { type: String, enum: ['open', 'closed', 'cancelled'], default: 'open' },
  inlineComment: { type: String },
  attachments: [{ type: String }],

  particulars: [InvoiceParticularSchema],

  discountRate: { type: Number, required: true },
  discountAmount: { type: Number, required: true },

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

InvoiceSchema.statics.createInvoice = async function (invoiceBody) {
  const invoice = this.create(invoiceBody);
  return invoice.toJSON({ virtuals: true });
};

InvoiceSchema.statics.getAll = async function (params) {
  const {
    from, to, serial, status,
  } = params;
  const criteria = {};
  if (from || to) criteria.raisedDate = {};
  if (from) criteria.raisedDate.$gte = new Date(from);
  if (to) criteria.raisedDate.$lte = new Date(to);
  if (serial) criteria.serial = { $regex: new RegExp(serial, 'i') };
  if (status) criteria.status = status;
  const invoices = await this.paginate(criteria, { lean: true });
  return invoices;
};

InvoiceSchema.plugin(mongoosePaginate);

module.exports = mongoose.model('Invoice', InvoiceSchema);
