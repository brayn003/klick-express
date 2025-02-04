const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate');

const TaxTypeSchema = new mongoose.Schema({
  type: { type: String, required: true },
  name: { type: String, required: true },
  rate: { type: Number, required: true },
  config: {},
}, {
  userAudits: true,
  timestamps: true,
  collection: 'tax_type',
});

TaxTypeSchema.statics.populateTaxTypes = async function (collection, key = 'taxTypes') {
  const taxTypesArr = await Promise.all(
    collection.map(async (p) => {
      const taxTypes = await this.find({ _id: { $in: p[key] } });
      return taxTypes;
    }),
  );
  return collection.map((p, index) => {
    const taxTypes = taxTypesArr[index];
    return { ...p, [key]: taxTypes };
  });
};

TaxTypeSchema.statics.getAll = async function (params) {
  const { name, ...rest } = params;
  const criteria = { ...rest };
  if (name) criteria.name = { $regex: new RegExp(name, 'i') };
  const taxTypes = await this.find(criteria);
  return taxTypes;
};

TaxTypeSchema.plugin(mongoosePaginate);

module.exports = mongoose.model('TaxType', TaxTypeSchema);
