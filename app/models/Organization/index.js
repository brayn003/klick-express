const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate');
const OrganizationUser = require('./User');

const OrganizationSchema = new mongoose.Schema({
  name: { type: String, required: true, minlength: 5 },
  pan: { type: String, required: true },
  phone: { type: String, default: '' },
  email: { type: String, default: '' },
  logo: { type: String, default: '' },
  signature: { type: String, default: '' },

  code: {
    type: String,
    minlength: 2,
    maxlength: 4,
    required: true,
  },

  industryType: { type: String, enum: ['product-based', 'service-based'], default: 'product-based' },
  isUnderComposition: { type: Boolean, default: false },

  invoicePreferences: {
    autoSerial: { type: Boolean, default: false },
    taxPerItem: { type: Boolean, default: false },
    includeQuantity: { type: Boolean, default: false },

    defaultTerms: { type: 'String', default: '' },

    defaultEmailFrom: { type: String, default: process.env.EMAIL_NOREPLY },
    defaultEmailSubject: { type: String, default: 'New Invoice Raised' },
    defaultEmailBody: { type: String, default: 'Here is your invoice' },

    defaultTemplate: { type: String, default: 'default' },
  },

  exponsePreferences: {
    showAccountType: { type: Boolean, default: false },
  },

}, {
  collection: 'organization',
  timestamps: true,
  userAudits: true,
});

OrganizationSchema.statics.createOne = async function (params, createdBy) {
  const organization = await this.create({ ...params, createdBy });
  return organization.toJSON({ virtuals: true });
};

OrganizationSchema.statics.getAll = async function (params) {
  const { name, user } = params;
  const criteria = {};
  if (name) criteria.name = { $regex: new RegExp(name, 'i') };
  if (user) {
    const roles = await OrganizationUser.find({ user });
    const organizationIds = roles.map(c => mongoose.Types.ObjectId(c.organization));
    criteria._id = { $in: organizationIds };
  }
  const organizations = await this.paginate(criteria, { lean: true });
  return organizations;
};

OrganizationSchema.statics.getById = async function (id) {
  const organization = await this.findById(id);
  return organization.toJSON({ virtuals: true });
};

OrganizationSchema.pre('save', async function (next) {
  this.invoiceSerialPrefix = this.name.substring(0, 3).toUpperCase();
  return next();
});

OrganizationSchema.plugin(mongoosePaginate);

module.exports = mongoose.model('Organization', OrganizationSchema);
