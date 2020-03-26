const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate');
const { ValidationError } = require('~helpers/extended-errors');

const BranchSchema = new mongoose.Schema({
  organization: { type: 'ObjectId', ref: 'Organization', required: true },

  name: { type: String, required: true },
  code: {
    type: String, minlength: 2, maxlength: 4,
  },
  addressLineOne: { type: String },
  addressLineTwo: { type: String },
  state: { type: 'ObjectId', ref: 'Location' },
  city: { type: 'ObjectId', ref: 'Location' },
  pincode: { type: String, default: null },

  gstNumber: { type: String, default: null },
}, {
  collection: 'organization_branch',
  timestamps: true,
});

BranchSchema.statics.getById = async function (id) {
  const branch = await this.findById(id)
    .populate('state')
    .populate('city')
    .populate('organization');
  return branch;
};

BranchSchema.statics.getAll = async function (params) {
  const { name, organization } = params;
  const criteria = {};
  if (name) criteria.name = { $regex: new RegExp(name, 'i') };
  if (organization) criteria.organization = organization;
  const branches = await this.paginate(criteria, { lean: true, populate: ['state', 'city', 'organization'] });
  return branches;
};

BranchSchema.statics.createOne = async function (params) {
  if (!params.organization) {
    throw new ValidationError('Organization needs to be mentioned');
  }
  const branchCount = await this.count({ organization: params.organization });
  const branch = await this.create({ ...params, code: `B${branchCount + 1}` });
  return branch;
};

BranchSchema.statics.patchOne = async function (id, params) {
  await this.updateOne({ _id: id }, { $set: params });
  const branch = await this.getById(id);
  return branch;
};

// BranchSchema.pre('save', async function (next) {
//   this.code = this.name.substring(0, 3).toUpperCase();
//   return next();
// });

BranchSchema.plugin(mongoosePaginate);

module.exports = mongoose.model('OrganizationBranch', BranchSchema);
