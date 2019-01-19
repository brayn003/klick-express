const mongoose = require('mongoose');

const ParticularSchema = new mongoose.Schema({
  organization: { type: 'ObjectId', ref: 'Organization' },

  hsnCode: { type: String, default: '' },

  name: { type: String, required: true },
  description: { type: String },
  indicativePrice: { type: Number, required: true },

}, {
  userAudits: true,
  timestamps: true,
  collection: 'particular',
});

ParticularSchema.statics.createParticular = async function (params, createdBy = null) {
  const particular = await this.create({ ...params, createdBy });
  return particular.toJSON({ virtuals: true });
};

module.exports = mongoose.model('InvoiceParticular', ParticularSchema);
