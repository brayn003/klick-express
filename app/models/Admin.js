const mongoose = require('mongoose');

const AdminSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
  },
  roles: {
    type: [String],
    enum: ['superadmin', 'admin'],
    default: ['admin'],
  },
}, {
  collection: 'admin',
  timestamps: true,
  userAudits: true,
});

AdminSchema.statics.addAdmin = async function (userId, createdBy = null) {
  const user = await this.model('User').findById(userId);
  if (!user) {
    throw new Error('User does not exist');
  }
  const admin = await this.create({ user, createdBy });
  return admin.populate('user');
};

module.exports = mongoose.model('Admin', AdminSchema);
