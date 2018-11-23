const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate');
const bcrypt = require('bcrypt-nodejs');
const omit = require('lodash/omit');

const { createJWT } = require('~helpers/jwt-service');

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

AdminSchema.statics.authenticate = async function (email, password) {
  const user = await this.model('User').findOne({ email }).select('+password');
  if (!user) {
    throw new Error('User does not exist 2');
  }

  const match = bcrypt.compareSync(password, user.password);
  if (!match) {
    throw new Error('Password is incorrect');
  }

  const admin = await this.findOne({ user: user.id });
  if (!admin) {
    throw new Error('User is not admin');
  }

  const token = await createJWT(
    { ...omit(user.toJSON({ virtuals: true }), ['password']), admin },
    process.env.ADMIN_AUTH_SECRET,
    { expiresIn: '1d' },
  );

  return token;
};

AdminSchema.statics.getAdmins = async function () {
  const admins = await this.paginate({}, { sort: { createdAt: -1 }, populate: 'user', lean: true });
  return admins;
};

AdminSchema.plugin(mongoosePaginate);

module.exports = mongoose.model('Admin', AdminSchema);
