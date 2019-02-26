const mongoose = require('mongoose');

const ParticularSchema = new mongoose.Schema({
  organization: { type: 'ObjectId', ref: 'Organization' },

  hsnCode: { type: String },
  sacCode: { type: String },

  name: { type: String, required: true },
  description: { type: String },
  indicativePrice: { type: Number, required: true },

}, {
  userAudits: true,
  timestamps: true,
  collection: 'particular',
});

ParticularSchema.statics.findOrAddParticulars = async function (particulars, createdBy = null) {
  const particularDetails = particulars.map(particular => particular.details);

  const oldParticularIds = particularDetails
    .filter(particular => typeof particular.details === 'string');
  const oldParticulars = await this.find({ _id: { $in: oldParticularIds } });

  const newParticularDetails = particularDetails
    .filter(particular => typeof particular.details === 'object');
  const newParticulars = await this.createParticulars(newParticularDetails, createdBy);

  return particularDetails.map((detail) => {
    if (typeof detail === 'string') {
      return oldParticulars.find(particular => particular.id === detail).toJSON({ virtuals: true });
    }
    if (typeof detail === 'object') {
      return newParticulars.unshift();
    }
    throw new Error('Not a valid value');
  });
};

ParticularSchema.statics.createParticulars = async function (particulars, createdBy = null) {
  const updatedParticulars = particulars.map(p => ({ ...p, createdBy }));
  const newParticulars = await this.insertMany(updatedParticulars);
  return newParticulars.toJSON({ virtuals: true });
};

ParticularSchema.statics.createParticular = async function (params, createdBy = null) {
  const particular = await this.create({ ...params, createdBy });
  return particular.toJSON({ virtuals: true });
};

module.exports = mongoose.model('InvoiceParticular', ParticularSchema);
