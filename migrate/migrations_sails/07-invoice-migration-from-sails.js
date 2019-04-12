const keyBy = require('lodash/keyBy');

const { convertMeta } = require('../migration-helpers');

const getIsGstCompliant = (inv) => {
  typeof inv.isGSTCompliant === 'undefined' ? !!inv.serial : inv.isGSTCompliant;
};

async function up(con) {
  const taxTypes = await con.collection('tax_type').find().toArray();
  const taxTypesMap = keyBy(taxTypes, 'type');

  const col = con.collection('invoice');

  const bulk = col.initializeUnorderedBulkOp();

  const oldInvs = await col.find().toArray();

  oldInvs.forEach((oldInv) => {
    const inv = { ...convertMeta(oldInv) };
    inv._id = oldInv._id;
    inv.organization = oldInv.organization;
    inv.client = oldInv.client;

    // inv.payments = oldInv.payments;

    inv.raisedDate = new Date(oldInv.raisedDate);
    inv.dueDate = oldInv.dueDate ? new Date(oldInv.dueDate) : null;
    inv.cancelledDate = oldInv.cancelledDate ? new Date(oldInv.cancelledDate) : null;
    inv.closedDate = oldInv.closedDate ? new Date(oldInv.closedDate) : null;

    inv.isGSTCompliant = typeof inv.isGSTCompliant === 'undefined' ? !!inv.serial : inv.isGSTCompliant;


    bulk.insert(inv);
  });

  await bulk.execute();
}

async function down() {
  console.log('the migration is irreversible');
}

module.exports = { up, down };
