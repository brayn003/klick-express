const { convertMeta } = require('../migration-helpers');

async function up(con) {
  const oldCol = con.collection('expensecategory');
  const col = con.collection('expense_category');

  const bulk = col.initializeUnorderedBulkOp();

  const oldCats = await oldCol.find().toArray();

  oldCats.forEach((oldCat) => {
    const cat = { ...convertMeta(oldCat) };
    cat.name = oldCat.name;
    cat.organization = oldCat.organization;
    cat.description = '';

    bulk.insert(cat);
  });

  await bulk.execute();
  await oldCol.drop();
}

async function down() {
  console.log('the migration is irreversible');
}

module.exports = { up, down };
