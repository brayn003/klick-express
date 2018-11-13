const { model, Schema } = require('mongoose');

const UserSchema = new Schema({
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
});

module.exports = model('User', UserSchema);
