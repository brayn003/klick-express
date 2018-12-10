const mongoose = require('moongoose');
const Location = require('./index.js');

const StateSchema = new mongoose.Schema({
  tin: { type: String, required: true },
  code: { type: String, required: true },
});

module.exports = Location.discriminator('state', StateSchema);
