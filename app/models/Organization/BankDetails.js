const mongoose = require('mongoose');

const BankDetailsSchema = new mongoose.Schema({
  organization: { type: 'ObjectId', ref: 'Organization', required: true },

  bankName: { type: String, default: '' },
  beneficiaryName: { type: String, required: true },
  accountNumber: { type: String, required: true },
  ifsc: { type: String, required: true },
  accountType: { type: String, enum: ['savings', 'current'], required: true },

}, {
  collection: 'organization_bankdetails',
  timestamps: true,
  userAudits: true,
});


module.exports = mongoose.model('OrganizationBankDetails', BankDetailsSchema);
