const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate');
const padStart = require('lodash/padStart');

const { renderHTML } = require('~helpers/template-service');
const { renderPDF } = require('~helpers/pdf-service');
const { uploadBuffer } = require('~helpers/upload-service');
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
  payments: [{ type: 'ObjectId', ref: 'Payment' }],

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
  includeQuantity: { type: Boolean, required: true },
  taxPerItem: { type: Boolean, required: true },
  taxInclusion: { type: String, enum: ['inclusive', 'exclusive'], required: true },
  serial: { type: String, default: null },
  status: { type: String, enum: ['open', 'closed', 'cancelled'], default: 'open' },
  inlineComment: { type: String },
  attachments: [{ type: String }],
  fileUrl: { type: String },
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

InvoiceSchema.statics.createOne = async function (invoiceBody) {
  const invoice = await this.create(invoiceBody);
  const fileUrl = await this.generatePDF(invoice.id);
  const updatedInvoice = await this.patchOne(invoice.id, { $set: { fileUrl } });
  return updatedInvoice;
};

InvoiceSchema.statics.getAll = async function (params) {
  const {
    from, to, serial, status, organization,
  } = params;
  const criteria = {};
  if (from || to) criteria.raisedDate = {};
  if (from) criteria.raisedDate.$gte = new Date(from);
  if (to) criteria.raisedDate.$lte = new Date(to);
  if (serial) criteria.serial = { $regex: new RegExp(serial, 'i') };
  if (status) criteria.status = status;
  if (organization) criteria.organization = organization;
  const invoices = await this.paginate(criteria, { lean: true, sort: { raisedDate: 'desc' } });
  return invoices;
};

InvoiceSchema.statics.getNewSerial = async function (params) {
  const { organization, branch } = params;
  const count = await this.count({
    organization: organization.id,
    organizationBranch: branch.id,
    serial: { $ne: null },
  }).sort('-createdAt');
  return `${organization.code}/${branch.code}/${padStart(count + 1, 6, 0)}`;
};

InvoiceSchema.statics.generateHTML = async function (id) {
  const invoice = await this.findById(id)
    .populate('organization')
    .populate('client')
    .populate({
      path: 'organizationBranch',
      populate: ['state', 'city'],
    })
    .populate({
      path: 'clientBranch',
      populate: ['state', 'city'],
    })
    .populate('particulars.details')
    .populate('particulars.taxes.taxType')
    .populate('taxes.taxType');

  if (!invoice) {
    throw new Error('Invoice doesn\'t exist');
  }

  const template = invoice.organization.invoicePreferences.defaultTemplate;
  return renderHTML(`templates/invoice/${template}`, { invoice });
};

InvoiceSchema.statics.generatePDF = async function (id) {
  const html = await this.generateHTML(id);
  const pdfBuffer = await renderPDF(html, { width: 1190, height: 1684 });
  const url = await uploadBuffer(pdfBuffer, { name: `invoices/${id}`, type: 'application/pdf' });
  return url;
};

InvoiceSchema.statics.patchOne = async function (id, params) {
  await this.updateOne({ _id: id }, params);
  const invoice = await this.findById(id);
  return invoice;
};


InvoiceSchema.plugin(mongoosePaginate);

module.exports = mongoose.model('Invoice', InvoiceSchema);
