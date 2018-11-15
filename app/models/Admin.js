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
}, { collection: 'admin' });

AdminSchema.statics.addAdmin = async function (userId) {
  const user = await this.model('User').findById(userId);
  if (!user) {
    throw new Error('User does not exist');
  }
  const admin = await this.create({ user });
  return admin.populate('user');
};

module.exports = mongoose.model('Admin', AdminSchema);
