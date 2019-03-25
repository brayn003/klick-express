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

ParticularSchema.statics.getOrAdd = async function (particulars, createdBy = null) {
  const particularDetails = particulars.map((particular) => {
    if (typeof particular.details === 'string') {
      return particular.details;
    }
    if (typeof particular.details === 'object') {
      return { indicativePrice: particular.rate, ...particular.details };
    }
    throw new Error('Not a valid value for detials');
  });

  const oldParticularIds = particularDetails
    .filter(pd => typeof pd === 'string');
  const oldParticulars = await this.find({ _id: { $in: oldParticularIds } });

  const newParticularDetails = particularDetails
    .filter(pd => typeof pd === 'object');
  const newParticulars = await this.createParticulars(newParticularDetails, createdBy);

  return particulars
    .map((particular) => {
      const { details } = particular;
      if (typeof details === 'string') {
        return {
          ...particular,
          details: oldParticulars.find(p => p.id === details).toJSON({ virtuals: true }).id,
        };
      }
      if (typeof details === 'object') {
        return {
          ...particular,
          details: newParticulars.shift(),
        };
      }
      throw new Error('Not a valid value');
    });
};

ParticularSchema.statics.createParticulars = async function (particulars, createdBy = null) {
  const updatedParticulars = particulars.map(p => ({ ...p, createdBy }));
  const newParticulars = await this.insertMany(updatedParticulars);
  return newParticulars;
};

ParticularSchema.statics.createParticular = async function (params, createdBy = null) {
  const particular = await this.create({ ...params, createdBy });
  return particular.toJSON({ virtuals: true });
};

module.exports = mongoose.model('InvoiceParticular', ParticularSchema);
