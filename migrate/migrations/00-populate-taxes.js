const reject = require('lodash/reject');

const taxSeed = [
  {
    type: 'cgst_0',
    rate: 0,
    name: 'CGST @0%',
    config: { isSameState: true, isSameUt: true },
  },
  {
    type: 'cgst_0.05',
    rate: 0.05,
    name: 'CGST @0.05%',
    config: { isSameState: true, isSameUt: true },
  },
  {
    type: 'cgst_0.125',
    rate: 0.125,
    name: 'CGST @0.125%',
    config: { isSameState: true, isSameUt: true },
  },
  {
    type: 'cgst_1.5',
    rate: 1.5,
    name: 'CGST @1.5%',
    config: { isSameState: true, isSameUt: true },
  },
  {
    type: 'cgst_2.5',
    rate: 2.5,
    name: 'CGST @2.5%',
    config: { isSameState: true, isSameUt: true },
  },
  {
    type: 'cgst_6',
    rate: 6,
    name: 'CGST @6%',
    config: { isSameState: true, isSameUt: true },
  },
  {
    type: 'cgst_9',
    rate: 9,
    name: 'CGST @9%',
    config: { isSameState: true, isSameUt: true },
  },
  {
    type: 'cgst_14',
    rate: 14,
    name: 'CGST @14%',
    config: { isSameState: true, isSameUt: true },
  },
  {
    type: 'sgst_0',
    rate: 0,
    name: 'SGST @0%',
    config: { isSameState: true },
  },
  {
    type: 'sgst_0.05',
    rate: 0.05,
    name: 'SGST @0.05%',
    config: { isSameState: true },
  },
  {
    type: 'sgst_0.125',
    rate: 0.125,
    name: 'SGST @0.125%',
    config: { isSameState: true },
  },
  {
    type: 'sgst_1.5',
    rate: 1.5,
    name: 'SGST @1.5%',
    config: { isSameState: true },
  },
  {
    type: 'sgst_2.5',
    rate: 2.5,
    name: 'SGST @2.5%',
    config: { isSameState: true },
  },
  {
    type: 'sgst_6',
    rate: 6,
    name: 'SGST @6%',
    config: { isSameState: true },
  },
  {
    type: 'sgst_9',
    rate: 9,
    name: 'SGST @9%',
    config: { isSameState: true },
  },
  {
    type: 'sgst_14',
    rate: 14,
    name: 'SGST @14%',
    config: { isSameState: true },
  },
  {
    type: 'igst_0',
    rate: 0,
    name: 'IGST @0%',
    config: { isSameState: false },
  },
  {
    type: 'igst_0.1',
    rate: 0.1,
    name: 'IGST @0.1%',
    config: { isSameState: false },
  },
  {
    type: 'igst_0.25',
    rate: 0.25,
    name: 'IGST @0.25%',
    config: { isSameState: false },
  },
  {
    type: 'igst_3',
    rate: 3,
    name: 'IGST @3%',
    config: { isSameState: false },
  },
  {
    type: 'igst_5',
    rate: 5,
    name: 'IGST @5%',
    config: { isSameState: false },
  },
  {
    type: 'igst_12',
    rate: 12,
    name: 'IGST @12%',
    config: { isSameState: false },
  },
  {
    type: 'igst_18',
    rate: 18,
    name: 'IGST @18%',
    config: { isSameState: false },
  },
  {
    type: 'igst_28',
    rate: 28,
    name: 'IGST @28%',
    config: { isSameState: false },
  },
  {
    type: 'utgst_0',
    rate: 0,
    name: 'UTGST @0%',
    config: { isSameUt: true },
  },
  {
    type: 'utgst_5',
    rate: 5,
    name: 'UTGST @5%',
    config: { isSameUt: true },
  },
  {
    type: 'utgst_12',
    rate: 12,
    name: 'UTGST @12%',
    config: { isSameUt: true },
  },
  {
    type: 'utgst_18',
    rate: 18,
    name: 'UTGST @18%',
    config: { isSameUt: true },
  },
  {
    type: 'utgst_28',
    rate: 28,
    name: 'UTGST @28%',
    config: { isSameUt: true },
  },
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
