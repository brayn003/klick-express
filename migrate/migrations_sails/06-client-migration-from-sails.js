const isEmpty = require('lodash/isEmpty');

const { convertMeta } = require('../migration-helpers');


async function up(con) {
  const clientCol = con.collection('client');
  const orgCol = con.collection('organization');
  const branchCol = con.collection('organization_branch');

  const orgBulk = orgCol.initializeUnorderedBulkOp();
  const branchBulk = branchCol.initializeUnorderedBulkOp();

  const clients = await clientCol.find().toArray();

  clients.forEach((client) => {
    const newClient = { ...convertMeta(client) };
    newClient._id = client._id;
    newClient.name = client.name;
    newClient.phone = client.mobile;
    newClient.email = client.email;
    newClient.logo = null;
    newClient.pan = null;
    newClient.verified = false;
    newClient.code = client.name.substring(0, 3).toUpperCase();
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
    newBranch.gst = isEmpty(client.gstin.trim()) ? client.gstin : null;

    orgBulk.insert(newClient);
    branchBulk.insert(newBranch);
  });

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
  await clientCol.drop();
}

async function down() {
  console.log('the migration is irreversible');
}

module.exports = { up, down };
