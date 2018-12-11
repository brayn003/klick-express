const mongoose = require('mongoose');

const organizationUserSchema = new mongoose.Schema({
  organization: { type: 'ObjectId', ref: 'Organization', required: true },
  user: { type: 'ObjectId', ref: 'User', required: true },
  role: { type: String, enum: ['owner', 'admin', 'member'], default: 'member' },
  level: { type: String, enum: ['branch', 'organization'], default: 'organization' },
  branch: { type: 'ObjectId', ref: 'OrganizationBranch' },
  signingAuthority: { type: Boolean, default: false },
}, {
  collection: 'organization_user',
  timestamps: true,
  userAudits: true,
});

organizationUserSchema.statics.add = async function (userId, orgId, by) {
  const oldRole = await this.findOne({ user: userId, organization: orgId });
  let role = {};
  if (oldRole && !oldRole.deleted) {
    throw new Error('User already exists in the organization');
  } else if (oldRole && oldRole.deleted) {
    role = await oldRole.restore({ user: userId, organization: orgId });
  } else {
    role = await this.create({ user: userId, organization: orgId, createdBy: by });
  }
  return role.toJSON({ virtuals: true });
};

organizationUserSchema.statics.remove = async function (userId, orgId, by) {
  await this.delete(by, { user: userId, organization: orgId });
  return true;
};

module.exports = mongoose.model('OrganizationUser', organizationUserSchema);
