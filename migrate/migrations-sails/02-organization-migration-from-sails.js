async function up(con) {
  const orgCol = con.collection('organization');
  const branchCol = con.collection('organization_branch');
  const orgUserCol = con.collection('organization_user');
  const bankCol = con.collection('organization_bankdetails');
  const roleCol = con.collection('role');

  const oldOrgs = await orgCol.find().toArray();

  oldOrgs.forEach((d) => {
    console.log(d);
  });
}

async function down() {
  console.log('down');
}

module.exports = { up, down };
