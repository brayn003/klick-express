const { convertMeta } = require('../migration-helpers');

async function up(con) {
  const col = con.collection('expense');
  const colp = con.collection('payment');

  const bulk = col.initializeUnorderedBulkOp();
  const bulk2 = col.initializeUnorderedBulkOp();
  const bulkp = colp.initializeUnorderedBulkOp();

  const oldExs = await col.find().toArray();

  oldExs.forEach((oldEx) => {
    const ex = { ...convertMeta(oldEx) };
    ex.title = oldEx.description;
    ex.expenseDate = new Date(oldEx.expenseDate);
    ex.dueDate = null;
    ex.organization = oldEx.organization;
    ex.category = oldEx.category;
    ex.serial = null;
    ex.attachments = [];
    if (oldEx.bill) ex.attachments[0] = oldEx.bill;
    ex.inlineComment = '';
    ex.accountType = oldEx.accountType || 'business';
    ex.taxInclusion = oldEx.taxInclusion;
    ex.taxableAmount = oldEx.amountBeforeTax;
    ex.taxAmount = oldEx.taxAmount;
    ex.total = oldEx.amountAfterTax;
    ex.taxes = [];
    ex.tdsAmount = oldEx.tdsAmount;
    ex.tdsRate = (oldEx.tdsAmount / oldEx.amountAfterTax) * 100;
    ex.amountPayable = oldEx.amountPayable;
    ex.roundedTotal = Math.round(oldEx.amountAfterTax);
    ex.roundedAmountPayable = Math.round(oldEx.amountPayable);
    ex.status = oldEx.paymentDate ? 'closed' : 'open';

    if (oldEx.paymentDate) {
      const exp = { ...convertMeta(oldEx) };
      exp.expense = oldEx._id;
      exp.amount = oldEx.amountAfterTax;
      exp.paymentDate = new Date(oldEx.paymentDate);
      exp.mode = oldEx.paymentMode;
      exp.inlineComment = '';
      exp.type = 'expense';

      bulkp.insert(exp);
    }

    bulk.find({ _id: oldEx._id }).updateOne(ex);
  });

  await bulk.execute();
  const bulkpResponse = await bulkp.execute();

  const payments = await colp
    .find({ _id: { $in: bulkpResponse.getInsertedIds().map(o => o._id) } })
    .toArray();

  payments.forEach((payment) => {
    bulk2.find({ _id: payment.expense }).updateOne({ $set: { payments: [payment._id] } });
  });
  await bulk2.execute();
}

async function down() {
  console.log('the migration is irreversible');
}

module.exports = { up, down };
