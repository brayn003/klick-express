const mongoose = require('mongoose');

const BranchSchema = new mongoose.Schema({
  organization: { type: 'ObjectId', ref: 'Organization', required: true },

  name: { type: String, required: true },
  code: {
    type: String, minlength: 2, maxlength: 4, required: true,
  },
  address_line1: { type: String, required: true },
  address_line2: { type: String },
  state: { type: 'ObjectId', ref: 'Location', required: true },
  city: { type: 'ObjectId', ref: 'Location', required: true },
  pincode: { type: String, required: true },
  bankDetails: { type: 'ObjectId', ref: 'OrganizationBankDetails' },
}, {
  collection: 'organization_branch',
  timestamps: true,
});

module.exports = mongoose.model('OrganizationBranch', BranchSchema);