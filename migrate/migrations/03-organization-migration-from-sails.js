const { convertMeta } = require('../migration-helpers');

async function up(con) {
  const orgCol = con.collection('organization');
  const branchCol = con.collection('organization_branch');
  const orgUserCol = con.collection('organization_user');
  const bankCol = con.collection('organization_bankdetails');
  const roleCol = con.collection('role');

  const bulkOrg = orgCol.initializeUnorderedBulkOp();
  const bulkBank = bankCol.initializeUnorderedBulkOp();
  const bulkBranch = branchCol.initializeUnorderedBulkOp();
  const bulkOrgUser = orgUserCol.initializeUnorderedBulkOp();

  const oldOrgs = await orgCol.find().toArray();
  const oldRoles = await roleCol.find().toArray();

  oldOrgs.forEach((oldOrg) => {
    const newOrg = { ...convertMeta(oldOrg) };
    newOrg._id = oldOrg._id;
    newOrg.name = oldOrg.name.trim();
    newOrg.pan = (oldOrg.panNumber || '').replace(/[ ]/g, '');
    newOrg.phone = `+91${(oldOrg.phone || '').replace(/(\+91)/g, '').replace(/[ ]/g, '')}`;
    newOrg.email = (oldOrg.email || '').replace(/[ ]/g, '');
    newOrg.logo = oldOrg.logo;
    newOrg.verified = true;
    newOrg.signature = oldOrg.signature;
    newOrg.code = oldOrg.invoiceSerialPrefix.replace(/[ ]/g, '');
    newOrg.industryType = oldOrg.type;
    newOrg.isUnderComposition = oldOrg.isUnderComposition;
    newOrg.invoicePreferences = {};
    newOrg.invoicePreferences.autoSerial = oldOrg.invoiceAutoSerial;
    newOrg.invoicePreferences.taxPerItem = oldOrg.invoiceTaxPerItem;
    newOrg.invoicePreferences.includeQuantity = oldOrg.type === 'product-based';
    newOrg.invoicePreferences.defaultTerms = oldOrg.invoiceTerms;
    newOrg.invoicePreferences.defaultEmailFrom = 'no-reply@klickconsulting.in';
    newOrg.invoicePreferences.defaultEmailSubject = oldOrg.invoiceEmailSubject;
    newOrg.invoicePreferences.defaultEmailBody = oldOrg.invoiceEmailBody;
    newOrg.expensePreferences = {};
    newOrg.expensePreferences.showAccountType = false;
    newOrg.referrer = null;

    const newBranch = { ...convertMeta(oldOrg) };
    newBranch.updatedAt = null;
    newBranch.organization = oldOrg._id;
    newBranch.name = 'Home Branch';
    newBranch.code = 'B1';
    newBranch.addressLineOne = oldOrg.address;
    newBranch.addressLineTwo = '';
    newBranch.state = oldOrg.locationState;
    newBranch.city = null;
    newBranch.pincode = null;
    newBranch.gstNumber = oldOrg.gstin;

    const newBank = { ...convertMeta(oldOrg) };
    newBank.updatedAt = null;
    newBank.organization = oldOrg._id;
    newBank.bankName = oldOrg.bankName;
    newBank.beneficiaryName = oldOrg.bankBeneficiaryName;
    newBank.accountNumber = (oldOrg.bankAccountNumber || '').replace(/[ ]/g, '');
    newBank.ifsc = (oldOrg.bankIFSC || '').replace(/[ ]/g, '');
    newBank.accountType = oldOrg.bankAccountType;

    bulkOrg.find({ _id: oldOrg._id }).replaceOne(newOrg);
    bulkBranch.insert(newBranch);
    bulkBank.insert(newBank);
  });

  oldRoles.forEach((oldRole) => {
    const newRole = { ...convertMeta(oldRole) };
    newRole.organization = oldRole.organization;
    newRole.user = oldRole.user;
    newRole.role = oldRole.role;
    newRole.signingAuthority = oldRole.role === 'owner';
    bulkOrgUser.insert(newRole);
  });


  await bulkOrg.execute();
  const bulkBranchResponse = await bulkBranch.execute();
  const branches = await branchCol
    .find({ _id: { $in: bulkBranchResponse.getInsertedIds().map(o => o._id) } })
    .toArray();
  const bulkOrg2 = orgCol.initializeUnorderedBulkOp();
  branches.forEach((branch) => {
    bulkOrg2.find({ _id: branch.organization }).updateOne({ $set: { defaultBranch: branch._id } });
  });
  await bulkOrg2.execute();
  await bulkBank.execute();
  await bulkOrgUser.execute();
  await roleCol.drop();
}

async function down() {
  console.log('the migration is irreversible');
}

module.exports = { up, down };
