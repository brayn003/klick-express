const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate');
const OrganizationUser = require('~models/Organization/User');
const Branch = require('~models/Organization/Branch');

const OrganizationSchema = new mongoose.Schema({
  name: { type: String, required: true, minlength: 5 },
  pan: { type: String, default: null },
  phone: { type: String, default: null },
  email: { type: String, default: null },
  logo: { type: String, default: null },
  signature: { type: String, default: null },
  verified: { type: Boolean, default: false },
  referrer: { type: 'ObjectId', ref: 'Organization' },
  defaultBranch: { type: 'ObjectId', ref: 'OrganizationBranch' },
  code: { type: String, minlength: 2, maxlength: 4 },

  industryType: { type: String, enum: ['product-based', 'service-based'], default: 'product-based' },
  isUnderComposition: { type: Boolean, default: false },

  invoicePreferences: {
    autoSerial: { type: Boolean, default: false },
    taxPerItem: { type: Boolean, default: false },
    includeQuantity: { type: Boolean, default: false },

    defaultTerms: { type: String, default: null },

    defaultEmailFrom: { type: String, default: process.env.EMAIL_NOREPLY },
    defaultEmailSubject: { type: String, default: 'New Invoice Raised' },
    defaultEmailBody: { type: String, default: 'Here is your invoice' },

    defaultTemplate: { type: String, default: 'default' },
  },

  expensePreferences: {
    showAccountType: { type: Boolean, default: false },
  },

}, {
  collection: 'organization',
  timestamps: true,
  userAudits: true,
});

OrganizationSchema.statics.createOne = async function (params) {
  const organization = await this.create(params);
  await OrganizationUser.createOne({
    user: params.createdBy,
    organization: organization.id,
    role: 'owner',
  });
  const branch = await Branch.createOne({
    name: 'Home Branch',
    organization: organization.id,
    createdBy: params.createdBy,
  });
  await this.updateOne({ _id: organization.id }, { defaultBranch: branch.id })
    .populate('defaultBranch');
  const newOrg = await this.getById(organization.id);
  return newOrg;
};

OrganizationSchema.statics.getAll = async function (params) {
  const {
    name, user, referrer, verified, page = 1,
  } = params;
  const criteria = {};
  if (referrer) criteria.referrer = referrer;
  if (verified) criteria.verified = verified;
  if (name) criteria.name = { $regex: new RegExp(name, 'i') };
  if (user) {
    const roles = await OrganizationUser.find({ user });
    const organizationIds = roles.map(c => mongoose.Types.ObjectId(c.organization));
    criteria._id = { $in: organizationIds };
  }
  const organizations = await this.paginate(criteria, {
    populate: {
      path: 'defaultBranch',
      populate: {
        path: 'state',
      },
    },
    lean: true,
    page: parseInt(page, 10),
  });
  return organizations;
};

OrganizationSchema.statics.getById = async function (id) {
  const organization = await this.findById(id)
    .populate('defaultBranch')
    .populate('createdBy');
  return organization;
};


OrganizationSchema.statics.patchOne = async function (id, details) {
  await this.findByIdAndUpdate(id, details);
  return this.findById(id);
};

OrganizationSchema.pre('save', function (next) {
  if (!this.code) this.code = this.name.substring(0, 3).toUpperCase();
  return next();
});

OrganizationSchema.plugin(mongoosePaginate);

module.exports = mongoose.model('Organization', OrganizationSchema);
