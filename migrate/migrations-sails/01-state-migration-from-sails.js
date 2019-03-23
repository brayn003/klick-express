const pick = require('lodash/pick');
const snakeCase = require('lodash/snakeCase');

async function up(con) {
  const stateCol = con.collection('locationstate');
  const oldStates = await stateCol.find().toArray();

  const locCol = await con.collection('location');

  const oldBulk = stateCol.initializeUnorderedBulkOp();
  const newBulk = locCol.initializeUnorderedBulkOp();

  oldStates.forEach((d) => {
    const nd = pick(d, ['_id', 'tin', 'code', 'name']);
    nd.key = snakeCase(d.name);
    nd.type = 'state';

    nd.deleted = !!d.deletedAt;
    if (nd.deleted) nd.deletedAt = new Date(d.deletedAt);

    nd.createdBy = null;
    nd.updatedBy = null;
    nd.createdAt = new Date(d.createdAt);
    nd.updatedAt = new Date(d.updatedAt);
    /* eslint-disable */
    nd.__v = 0;
    /* eslint-enable */
    oldBulk.find({ _id: d._id }).remove();
    newBulk.insert(nd);
  });

  await oldBulk.execute();
  await newBulk.execute();
  await stateCol.drop();
}

async function down(con) {
  const stateCol = con.collection('locationstate');
  const locCol = await con.collection('location');

  const newStates = await locCol.find({ type: 'state' }).toArray();

  const oldBulk = stateCol.initializeUnorderedBulkOp();
  const newBulk = locCol.initializeUnorderedBulkOp();

  newStates.forEach((nd) => {
    const d = pick(nd, ['_id', 'tin', 'code', 'name']);
    d.createdAt = nd.createdAt.getTime();
    d.updatedAt = nd.updatedAt.getTime();
    d.deletedAt = nd.deleted ? nd.deletedAt.getTime() : null;

    newBulk.find({ _id: nd._id }).remove();
    oldBulk.insert(d);
  });

  await newBulk.execute();
  await oldBulk.execute();
}

module.exports = { up, down };
