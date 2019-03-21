const mongoose = require('moongoose');
const Location = require('./index.js');

const CitySchema = new mongoose.Schema({});

module.exports = Location.discriminator('city', CitySchema);
