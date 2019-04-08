const mongoose = require('mongoose');
const keyBy = require('lodash/keyBy');
const TaxType = require('~models/TaxType');

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

ParticularSchema.statics.getOrAdd = async function (particulars) {
  const particularDetails = particulars.map((particular) => {
    if (typeof particular.details === 'string') {
      return particular.details;
    }
    if (typeof particular.details === 'object') {
      return { indicativePrice: particular.rate, ...particular.details };
    }
    throw new Error('Not a valid value for detials');
  });

  const allTaxTypeIds = particulars
    .reduce((agg, particular) => (particular.taxes || []).reduce((agg2, tax) => {
      if (agg2.indexOf(tax.taxType) === -1) {
        return agg2.concat(tax.taxType);
      }
      return agg2;
    }, agg), []);

  const allTaxTypes = await TaxType.find({ _id: { $in: allTaxTypeIds } });

  if (allTaxTypeIds.length !== allTaxTypes.length) {
    throw new Error('Taxes don\'t exist');
  }

  const taxTypesMap = keyBy(allTaxTypes, '_id');

  const newParticularDetails = particularDetails.filter(pd => typeof pd === 'object');
  const newParticulars = await this.createParticulars(newParticularDetails);
  const newParticularIds = newParticulars.map(p => p.id);

  const allParticularIds = particulars.map((particular) => {
    const { details } = particular;
    if (typeof details === 'string') return details;
    if (typeof details === 'object') return newParticularIds.shift();
    throw new Error('Not a valid value');
  });
  const allParticulars = await this.find({ _id: { $in: allParticularIds } });

  const finalParticulars = allParticulars.map((details, index) => ({
    ...particulars[index],
    taxes: particulars[index].taxes.map(tax => ({
      ...tax,
      taxType: taxTypesMap[tax.taxType],
    })),
    details,
  }));

  return finalParticulars;
};

ParticularSchema.statics.createParticulars = async function (particulars) {
  const updatedParticulars = particulars.map(p => ({ ...p }));
  const newParticulars = await this.insertMany(updatedParticulars);
  return newParticulars;
};

ParticularSchema.statics.createParticular = async function (params, createdBy = null) {
  const particular = await this.create({ ...params, createdBy });
  return particular;
};

module.exports = mongoose.model('InvoiceParticular', ParticularSchema);
