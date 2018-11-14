const mongoose = require('mongoose');
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
  firstName: String,
  lastName: String,
  avatar: String,
}, { collection: 'user' });

UserSchema.statics.authenticate = async function authenticate(email, password) {
  const user = await this.findOne({ email }).select('+password');
  if (!user) {
    throw new Error('User does not exist');
  }
  const match = bcrypt.compareSync(password, user.password);
  if (!match) {
    throw new Error('Password is incorrect');
  }
  const token = await createJWT(omit(user.toJSON(), ['password']), process.env.AUTH_SECRET, { expiresIn: '1d' });
  return token;
};

UserSchema.pre('save', (next) => {
  if (!this.isModified('password')) {
    this.password = bcrypt.hashSync(this.password);
  }
  return next();
});

module.exports = mongoose.model('User', UserSchema);
