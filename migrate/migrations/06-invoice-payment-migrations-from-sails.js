const isEqual = require('lodash/isEqual');

const { convertMeta } = require('../migration-helpers');

async function up(con) {
  const oldCol = con.collection('invoicepayment');
  const col = con.collection('payment');

  const bulk = col.initializeUnorderedBulkOp();

  const oldPs = await oldCol.find().toArray();

  const uniqueInvoices = oldPs.reduce((agg, payment) => {
    if (agg.indexOf(payment.invoice) === -1) {
      agg.push(payment.invoice);
    }
    return agg;
  }, []);

  const invoices = await con.collection('invoice').find({ _id: { $in: uniqueInvoices } }).toArray();
  oldPs.forEach(async (oldP) => {
    const invoice = invoices.find(i => isEqual(i._id, oldP.invoice));
    if (!invoice) {
      console.log(`No invoice ${oldP.invoice} found for ${oldP._id}`);
    }

    let deletedAt = (new Date()).valueOf();
    if (invoice) {
      if (invoice.deletedAt) {
        // eslint-disable-next-line prefer-destructuring
        deletedAt = invoice.deletedAt;
      } else {
        deletedAt = null;
      }
    }
    const p = {
      ...convertMeta({
        ...oldP,
        deletedAt,
      }),
    };
    p._id = oldP._id;
    p.invoice = oldP.invoice;
    p.amount = oldP.amount;
    p.paymentDate = new Date(oldP.paymentDate);
    p.mode = oldP.paymentMode;
    p.inlineComment = '';
    p.type = 'invoice';

    bulk.insert(p);
  });

  await bulk.execute();
  await oldCol.drop();
}

async function down() {
  console.log('the migration is irreversible');
}

module.exports = { up, down };
