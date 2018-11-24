const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate');
const bcrypt = require('bcrypt-nodejs');
const omit = require('lodash/omit');

const { createJWT } = require('../helpers/jwt-service');

const UserSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
    select: false,
  },
  name: String,
  avatar: String,
}, {
  collection: 'user',
  timestamps: true,
});

UserSchema.statics.authenticate = async function (email, password) {
  const user = await this.findOne({ email }).select('+password');
  if (!user) {
    throw new Error('User does not exist');
  }
  const match = bcrypt.compareSync(password, user.password);
  if (!match) {
    throw new Error('Password is incorrect');
  }
  const token = await createJWT(
    omit(user.toJSON({ virtuals: true }), ['password']),
    process.env.AUTH_SECRET,
    { expiresIn: '1d' },
  );
  return token;
};

UserSchema.statics.getUsers = async function (params) {
  const { email, name } = params;
  const criteria = {};
  if (email) criteria.email = { $regex: new RegExp(email, 'i') };
  if (name) criteria.name = { $regex: new RegExp(name, 'i') };
  const user = await this.paginate(criteria, { lean: true });
  return user;
};

UserSchema.pre('save', (next) => {
  if (!this.isModified('password')) {
    this.password = bcrypt.hashSync(this.password);
  }
  return next();
});

UserSchema.plugin(mongoosePaginate);

module.exports = mongoose.model('User', UserSchema);
