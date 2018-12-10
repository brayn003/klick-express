const mongoose = require('moongoose');
const Location = require('./index.js');

const StateSchema = new mongoose.Schema({});

module.exports = Location.discriminator('state', StateSchema);
