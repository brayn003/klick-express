const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate');
const padStart = require('lodash/padStart');
const sumBy = require('lodash/sumBy');

const { renderHTML } = require('~helpers/template-service');
const { uploadBuffer } = require('~helpers/upload-service');
const { convertToImage, convertToPDF } = require('~helpers/html-convert-service');
const { ValidationError, MissingError } = require('~helpers/extended-errors');
const PaymentInvoice = require('~models/Payment/Invoice');
const Particular = require('~models/Particular');
const Branch = require('~models/Organization/Branch');
const Organization = require('~models/Organization');
const InvoiceService = require('~helpers/invoice-service');
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
  taxInclusion: { type: String, enum: ['inclusive', 'exclusive'], default: 'exclusive' },
  serial: { type: String, default: null },
  status: { type: String, enum: ['open', 'closed', 'cancelled'], default: 'open' },
  inlineComment: { type: String, default: null },
  attachments: [{ type: String }],
  fileUrl: { type: String },
  previewUrl: { type: String },
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


InvoiceSchema.statics.createOne = async function (params) {
  const {
    organizationBranch: orgBranchId,
    raisedDate,
    generateSerial: bodyGenerateSerial = false,
    currency = 'INR',
    taxInclusion = 'inclusive',
    particulars: bodyParticulars,
    dueDate = null,
    isUnderLUT = false,
    client: clientId = null,
    clientBranch: clientBranchId = null,
    inlineComment = '',
    attachements = null,
    discountRate,
    discountAmount,
    tdsRate,
    tdsAmount,
    createdBy,
  } = params;

  const particulars = await Particular.getOrAdd(bodyParticulars);
  const orgBranch = await Branch.getById(orgBranchId);
  if (!orgBranch) {
    throw new Error('Organization branch does not exist');
  }
  const organization = await Organization.getById(orgBranch.organization);

  let client = {};
  let clientBranch = {};
  if (!clientId && clientBranchId) {
    clientBranch = await Branch.getById(clientBranchId);
    client = await Organization.getById(clientBranch.id);
  } else if ((clientId && !clientBranchId) || (clientId && clientBranchId)) {
    client = await Organization.getById(clientId);
    clientBranch = await Branch.getById(client.defaultBranch);
  }

  let generateSerial = bodyGenerateSerial;
  if (organization.invoicePreferences.autoSerial) {
    generateSerial = true;
  }

  let serial = null;
  if (generateSerial) {
    serial = await this.getNewSerial({ organization, branch: orgBranch });
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
    isSameState: orgBranch.state === clientBranch.state,
    taxInclusion,
    discountAmount,
    discountRate,
    tdsRate,
    tdsAmount,
  });

  const invoice = await this.create({
    organization: organization.id,
    organizationBranch: orgBranchId,
    client: client.id,
    clientBranch: clientBranch.id,
    raisedDate,
    dueDate,
    isGSTCompliant: !!orgBranch.gstNumber,
    isUnderComposition: organization.isUnderComposition,
    isUnderLUT,
    currency,
    taxPerItem: organization.invoicePreferences.taxPerItem,
    includeQuantity: organization.invoicePreferences.includeQuantity,
    serial,
    inlineComment,
    attachements,
    createdBy,
    ...invoiceInstance.getModeledData(),
  });
  const fileUrl = await this.generatePDF(invoice.id);
  const previewUrl = await this.generateImage(invoice.id);
  await this.updateOne({ _id: invoice.id }, { $set: { fileUrl, previewUrl } });
  const updatedInvoice = this.getById(invoice.id);
  return updatedInvoice;
};

// primitive update logic needs to be iterated upon, e.g. amount cannot be smaller that payments
InvoiceSchema.statics.patchOne = async function (id, params) {
  const oldInvoice = await this.getById(id);
  const {
    organizationBranch: orgBranchId = oldInvoice.organizationBranch,
    raisedDate = oldInvoice.raisedDate,
    currency = oldInvoice.currency || 'INR',
    taxInclusion = oldInvoice.taxInclusion || 'inclusive',
    particulars: bodyParticulars = oldInvoice.particulars,
    dueDate = oldInvoice.dueDate || null,
    isUnderLUT = oldInvoice.isUnderLUT || false,
    client: clientId = oldInvoice.client || null,
    clientBranch: clientBranchId = oldInvoice.clientBranch || null,
    inlineComment = oldInvoice.inlineComment || '',
    attachements = oldInvoice.attachments || null,
    discountRate = oldInvoice.discountRate,
    discountAmount = oldInvoice.discountAmount,
    tdsRate = oldInvoice.tdsRate,
    tdsAmount = oldInvoice.tdsAmount,
    updatedBy,
  } = params;

  const particulars = await Particular.getOrAdd(bodyParticulars);
  const orgBranch = await Branch.getById(orgBranchId);
  if (!orgBranch) {
    throw new Error('Organization branch does not exist');
  }
  const organization = await Organization.getById(orgBranch.organization);

  let client = {};
  let clientBranch = {};
  if (!clientId && clientBranchId) {
    clientBranch = await Branch.getById(clientBranchId);
    client = await Organization.getById(clientBranch.id);
  } else if ((clientId && !clientBranchId) || (clientId && clientBranchId)) {
    client = await Organization.getById(clientId);
    clientBranch = await Branch.getById(client.defaultBranch);
  }

  const isTaxable = (
    !!orgBranch.gstNumber
    && !isUnderLUT
    && !organization.isUnderComposition
    && !!oldInvoice.serial
  );

  const invoiceInstance = new InvoiceService({
    particulars,
    isTaxable,
    isSameState: orgBranch.state === clientBranch.state,
    taxInclusion,
    discountAmount,
    discountRate,
    tdsRate,
    tdsAmount,
  });

  await this.updateOne({ _id: id }, {
    organization: organization.id,
    organizationBranch: orgBranchId,
    client: client.id,
    clientBranch: clientBranch.id,
    raisedDate,
    dueDate,
    isGSTCompliant: !!orgBranch.gstNumber,
    isUnderComposition: organization.isUnderComposition,
    isUnderLUT,
    currency,
    taxPerItem: organization.invoicePreferences.taxPerItem,
    includeQuantity: organization.invoicePreferences.includeQuantity,
    inlineComment,
    attachements,
    updatedBy,
    ...invoiceInstance.getModeledData(),
  });

  const fileUrl = await this.generatePDF(id);
  const previewUrl = await this.generateImage(id);
  await this.updateOne({ _id: id }, { fileUrl, previewUrl });
  const updatedInvoice = await this.getById(id);
  return updatedInvoice;
};


InvoiceSchema.statics.getById = async function (id) {
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
    .populate('taxes.taxType')
    .populate('payments');
  return invoice;
};

InvoiceSchema.statics.getAll = async function (params) {
  const {
    from, to, serial, status, organization, page = 1,
  } = params;
  const criteria = {};
  if (from || to) criteria.raisedDate = {};
  if (from) criteria.raisedDate.$gte = new Date(from);
  if (to) criteria.raisedDate.$lte = new Date(to);
  if (serial) criteria.serial = { $regex: new RegExp(serial, 'i') };
  if (status) criteria.status = status;
  if (organization) criteria.organization = organization;
  const invoices = await this.paginate(criteria, {
    lean: true,
    sort: { _id: -1 },
    populate: [
      'payments',
    ],
    page: parseInt(page, 10),
  });
  return invoices;
};

InvoiceSchema.statics.createPayment = async function (params) {
  if (params.amount < 0) throw new ValidationError('Amount cannot be less than 0');
  if (!params.invoice) throw new ValidationError('Need to provide an invoice id');
  const oldInvoice = await this.getById(params.invoice);
  if (!oldInvoice) throw new MissingError('Invoice does not exist');
  const paymentAmountDone = Math.round(sumBy(oldInvoice.payments, 'amount'));
  const paymentRemaining = oldInvoice.roundedAmountReceivable - paymentAmountDone;
  if (params.amount > paymentRemaining) throw new ValidationError('Cannot pay more than the remaining value');
  const paymentInvoice = await PaymentInvoice.createOne(params);
  const updateSet = {};
  if (params.amount === paymentRemaining) updateSet.status = 'closed';
  await this.updateOne({ _id: params.invoice }, {
    $push: { payments: paymentInvoice.id },
    $set: updateSet,
  });
  const invoice = await this.getById(params.invoice);
  return invoice;
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
  const pdfBuffer = await convertToPDF(html, { height: 1684, width: 1190 });
  const url = await uploadBuffer(pdfBuffer, { name: `invoices/${id}`, type: 'application/pdf' });
  return url;
};

InvoiceSchema.statics.generateImage = async function (id) {
  const html = await this.generateHTML(id);
  const imageStream = await convertToImage(html, { windowSize: { height: 1684, width: 1190 } });
  const url = await uploadBuffer(imageStream, { name: `invoice-previews/${id}`, type: 'image/jpeg' });
  return url;
};


InvoiceSchema.plugin(mongoosePaginate);

module.exports = mongoose.model('Invoice', InvoiceSchema);
