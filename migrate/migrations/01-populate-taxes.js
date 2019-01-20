const reject = require('lodash/reject');

const taxSeed = [
  { type: 'cgst_0', rate: 0, name: 'CGST @0%' },
  { type: 'cgst_2.5', rate: 2.5, name: 'CGST @2.5%' },
  { type: 'cgst_6', rate: 6, name: 'CGST @6%' },
  { type: 'cgst_9', rate: 9, name: 'CGST @9%' },
  { type: 'cgst_14', rate: 14, name: 'CGST @14%' },
  { type: 'sgst_0', rate: 0, name: 'SGST @0%' },
  { type: 'sgst_2.5', rate: 2.5, name: 'SGST @2.5%' },
  { type: 'sgst_6', rate: 6, name: 'SGST @6%' },
  { type: 'sgst_9', rate: 9, name: 'SGST @9%' },
  { type: 'sgst_14', rate: 14, name: 'SGST @14%' },
  { type: 'igst_0', rate: 0, name: 'IGST @0%' },
  { type: 'igst_5', rate: 5, name: 'IGST @5%' },
  { type: 'igst_12', rate: 12, name: 'IGST @12%' },
  { type: 'igst_18', rate: 18, name: 'IGST @18%' },
  { type: 'igst_28', rate: 28, name: 'IGST @28%' },
  { type: 'utgst_0', rate: 0, name: 'UTGST @0%' },
  { type: 'utgst_5', rate: 5, name: 'UTGST @5%' },
  { type: 'utgst_12', rate: 12, name: 'UTGST @12%' },
  { type: 'utgst_18', rate: 18, name: 'UTGST @18%' },
  { type: 'utgst_28', rate: 28, name: 'UTGST @28%' },
];

async function up(con) {
  const col = con.collection('tax_type');
  const taxTypeTypes = taxSeed.map(t => t.type);
  const existingTypes = await col.find({ type: { $in: taxTypeTypes } }).toArray();
  const doneTypes = existingTypes.map(t => t.type);
  const newTaxTypes = reject(taxSeed, t => doneTypes.indexOf(t.type) !== -1);
  if (newTaxTypes && newTaxTypes.length) {
    await col.insertMany(newTaxTypes.map((newTaxType) => {
      const nu = newTaxType;
      nu.createdBy = null;
      nu.updatedBy = null;
      nu.deleted = false;
      nu.createdAt = new Date();
      nu.updatedAt = new Date();
      nu.__v = 0;
      return nu;
    }));
  }
  await col.createIndex({ type: 1 });
  return true;
}

async function down(con) {
  const col = con.collection('tax_type');
  const taxTypeTypes = taxSeed.map(t => t.type);
  await col.deleteMany({ type: { $in: taxTypeTypes } });
  return true;
}

module.exports = { up, down };
