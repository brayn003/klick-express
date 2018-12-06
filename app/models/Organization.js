const mongoose = require('mongoose');

const organizationSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    minlength: 5,
  },
  phone: {
    type: String,
    default: '',
  },
  email: {
    type: String,
    default: '',
  },
  locationState: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'LocationState',
  },
  logo: {
    type: String,
    default: '',
  },
  address: {
    type: String,
    default: '',
  },
  gstin: {
    type: String,
    default: '',
  },
  panNumber: {
    type: String,
    default: '',
  },
  isGSTRegistered: {
    type: Boolean,
    default: false,
  },
  isUnderComposition: {
    type: Boolean,
    default: false,
  },
  type: {
    type: String,
    enum: ['product-based', 'service-based'],
    default: 'product-based',
  },
  signature: {
    type: String,
    default: '',
  },
  bankName: {
    type: String,
    default: '',
  },
  bankBeneficiaryName: {
    type: String,
    default: '',
  },
  bankAccountNumber: {
    type: String,
    default: '',
  },
  bankIFSC: {
    type: String,
    default: '',
  },
  bankAccountType: {
    type: String,
    enum: ['savings', 'current'],
  },
  invoiceSerialPrefix: {
    type: String,
    minlength: 2,
    maxlength: 4,
  },
  invoiceTerms: {
    type: String,
    default: '',
  },
  invoiceAutoSerial: {
    type: Boolean,
    default: false,
  },
  invoiceTaxPerItem: {
    type: Boolean,
    default: false,
  },
  invoiceEmailFrom: {
    type: String,
    default: process.env.EMAIL_NOREPLY,
  },
  invoiceEmailSubject: {
    type: String,
    default: 'Your invoice is ready.',
  },
  invoiceEmailBody: {
    type: String,
    default: 'Here is your invoice.',
  },
  invoiceTemplate: {
    type: String,
    default: 'default',
  },
  expenseShowAccountType: {
    type: Boolean,
    default: false,
  },

}, {
  collection: 'organization',
  timestamps: true,
  userAudits: true,
});

organizationSchema.statics.createOrganization = async function (params, createdBy) {
  const organization = await this.create({ ...params, createdBy });
  return organization.toJSON({ virtuals: true });
};

organizationSchema.pre('save', async function (next) {
  this.invoiceSerialPrefix = this.name.substring(0, 3).toUpperCase();
  return next();
});

module.exports = mongoose.model('Organization', organizationSchema);