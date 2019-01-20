const mongoose = require('mongoose');

const TaxTypeSchema = new mongoose.Schema({
  type: { type: String, required: true },
  name: { type: String, required: true },
  rate: { type: Number, required: true },
}, {
  userAudits: true,
  timestamps: true,
  collection: 'tax_type',
});

module.exports = mongoose.model('TaxType', TaxTypeSchema);

// TaxTypeSchema.statics.validateTaxes = async function (taxTypesIds, params) {
//   if(params.isSameState) {

//   }
// }
