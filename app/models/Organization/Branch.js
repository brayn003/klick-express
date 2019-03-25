const mongoose = require('mongoose');

const BranchSchema = new mongoose.Schema({
  organization: { type: 'ObjectId', ref: 'Organization', required: true },

  name: { type: String, required: true },
  code: {
    type: String, minlength: 2, maxlength: 4, required: true,
  },
  addressLineOne: { type: String, required: true },
  addressLineTwo: { type: String },
  state: { type: 'ObjectId', ref: 'Location', required: true },
  city: { type: 'ObjectId', ref: 'Location', required: true },
  pincode: { type: String, required: true },

  gstNumber: { type: String, required: true },
}, {
  collection: 'organization_branch',
  timestamps: true,
});

BranchSchema.statics.getById = async function (id) {
  const branch = await this.findById(id);
  if (branch) {
    return branch.toJSON({ virtuals: true });
  }
  return null;
};

module.exports = mongoose.model('OrganizationBranch', BranchSchema);
