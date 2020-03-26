const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate');
const Location = require('./index.js');


const StateSchema = new mongoose.Schema({
  tin: { type: String, required: true },
  code: { type: String, required: true },
});


StateSchema.statics.getAll = async function (params) {
  const { name } = params;
  const criteria = {};
  if (name) criteria.name = { $regex: new RegExp(name, 'i') };
  const states = await this.paginate(criteria, { lean: true });
  return states;
};

StateSchema.plugin(mongoosePaginate);

module.exports = Location.discriminator('state', StateSchema);
