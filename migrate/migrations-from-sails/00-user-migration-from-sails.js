const pick = require('lodash/pick');
const startCase = require('lodash/startCase');
const camelCase = require('lodash/camelCase');

async function up(con) {
  const userCol = con.collection('user');
  const oldUsers = await userCol.find().toArray();

  const indexes = await userCol.indexInformation();
  if (indexes.username_1) {
    await userCol.dropIndex('username_1');
  }

  const bulk = userCol.initializeUnorderedBulkOp();
  oldUsers.forEach((u) => {
    const nu = pick(u, ['email', 'password']);
    nu.name = startCase(u.username);
    nu.avatar = null;
    nu.deleted = !!u.deletedAt;
    if (nu.deleted) nu.deletedAt = new Date(u.deletedAt);
    nu.createdBy = null;
    nu.updatedBy = null;
    nu.createdAt = new Date(u.createdAt);
    nu.updatedAt = new Date(u.updatedAt);
    /* eslint-disable */
    nu.__v = 0;
    bulk.find({ _id: u._id }).updateOne(nu);
    /* eslint-enable */
  });

  try {
    await bulk.execute();
  } catch (err) {
    throw new Error(err);
  }
  return true;
}


async function down(con) {
  const userCol = con.collection('user');
  const newUsers = await userCol.find().toArray();

  const bulk = userCol.initializeUnorderedBulkOp();
  newUsers.forEach((u) => {
    const ou = pick(u, ['email', 'password']);
    ou.fullName = '';
    ou.lastName = '';
    ou.createdAt = u.createdAt.getTime();
    ou.updatedAt = u.updatedAt.getTime();
    ou.username = camelCase(u.name);
    ou.deletedAt = u.deleted ? u.deletedAt.getTime() : null;
    /* eslint-disable */
    bulk.find({ _id: u._id }).updateOne(ou);
    /* eslint-enable */
  });

  try {
    await bulk.execute();
  } catch (err) {
    throw new Error(err);
  }

  await userCol.createIndex({ username: 1 });

  return true;
}

module.exports = { up, down };
