const isEmpty = require('lodash/isEmpty');
const mongoose = require('mongoose');
const { convertMeta } = require('../migration-helpers');


async function up(con) {
  const clientCol = con.collection('client');
  const orgCol = con.collection('organization');
  const branchCol = con.collection('organization_branch');
  const invoiceCol = con.collection('invoice');

  const orgBulk = orgCol.initializeUnorderedBulkOp();
  const branchBulk = branchCol.initializeUnorderedBulkOp();
  const invoiceBulk = invoiceCol.initializeUnorderedBulkOp();
  const clientBulk = clientCol.initializeUnorderedBulkOp();

  const organizations = await orgCol.aggregate([
    {
      $lookup:
        {
          from: 'organization_branch',
          localField: 'defaultBranch',
          foreignField: '_id',
          as: 'defaultBranch',
        },

    },
    {
      $project:
      {
        name: 1,
        phone: 1,
        defaultBranch: { $arrayElemAt: ['$defaultBranch', 0] },
      },
    },
  ]).toArray();
  const organizationMobiles = organizations.map(o => o.phone);
  organizationMobiles.forEach((o) => {
    clientBulk.find({ mobile: new RegExp(o.phone, 'g') }).update({ $set: { mobile: '' } });
  });


  const clients = await clientCol.find().toArray();


  clients.forEach((client) => {
    const existingOrg = organizations.find(o => (
      o.phone.replace(/[ ]/g, '').replace(/(\+91)/g, '').replace(/[^0-9.]/g, '') === client.mobile.replace(/(\+91)/, '').replace(/[^0-9.]/g, '').replace(/[ ]/g, '')
      && o.defaultBranch.gstNumber.replace(/[ ]/g, '') === client.gstin.replace(/[ ]/g, '')
    ));
    if (existingOrg) {
      console.log('client exists -->', client.name, client.gstin, '-->', existingOrg.name, existingOrg.defaultBranch.gstNumber);
      invoiceBulk
        .find({
          client: mongoose.mongo.ObjectId(client._id),
        })
        .update({
          $set: {
            client: mongoose.mongo.ObjectId(existingOrg._id),
          },
        });
      return;
    }
    // if()
    const newClient = { ...convertMeta(client) };
    newClient._id = client._id;
    newClient.name = client.name.trim();
    newClient.phone = `+91${(client.mobile || '').replace(/(\+91)/g, '').replace(/[ ]/g, '')}`;
    newClient.email = (client.email || '').replace(/[ ]/g, '');
    newClient.logo = null;
    newClient.pan = null;
    newClient.verified = false;
    newClient.code = client.name.substring(0, 3).toUpperCase().replace(/[ ]/g, '');
    newClient.referrer = client.organization;
    newClient.signature = null;
    newClient.industryType = 'product-based';
    newClient.isUnderComposition = false;
    newClient.invoicePreferences = {};
    newClient.invoicePreferences.autoSerial = false;
    newClient.invoicePreferences.taxPerItem = false;
    newClient.invoicePreferences.includeQuantity = false;
    newClient.invoicePreferences.defaultTerms = null;
    newClient.invoicePreferences.defaultEmailFrom = 'no-reply@klickconsulting.in';
    newClient.invoicePreferences.defaultEmailSubject = 'New Invoice Raised';
    newClient.invoicePreferences.defaultEmailBody = 'Here is your invoice';
    newClient.expensePreferences = {};
    newClient.expensePreferences.showAccountType = false;

    const newBranch = { ...convertMeta(client) };
    newBranch.updatedAt = null;
    newBranch.organization = client._id;
    newBranch.addressLineOne = client.address;
    newBranch.addressLineTwo = '';
    newBranch.state = client.locationState;
    newBranch.city = null;
    newBranch.pincode = null;
    newBranch.gstNumber = isEmpty((client.gstin || '').replace(/[ ]/g, '')) ? client.gstin.replace(/[ ]/g, '') : null;

    orgBulk.insert(newClient);
    branchBulk.insert(newBranch);
  });

  await clientBulk.execute();

  await orgBulk.execute();
  const bulkBranchResponse = await branchBulk.execute();
  const branches = await branchCol
    .find({ _id: { $in: bulkBranchResponse.getInsertedIds().map(o => o._id) } })
    .toArray();
  const orgBulk2 = orgCol.initializeUnorderedBulkOp();
  branches.forEach((branch) => {
    orgBulk2.find({ _id: branch.organization }).updateOne({ $set: { defaultBranch: branch._id } });
  });
  await orgBulk2.execute();
  await invoiceBulk.execute();
  await clientCol.drop();
}

async function down() {
  console.log('the migration is irreversible');
}

module.exports = { up, down };
