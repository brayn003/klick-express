const keyBy = require('lodash/keyBy');

const { convertMeta } = require('../migration-helpers');
const InvoiceService = require('../../app/helpers/invoice-service');

async function up(con) {
  const taxTypes = await con.collection('tax_type').find().toArray();
  const taxTypesMap = keyBy(taxTypes, 'type');

  const branches = await con.collection('organization_branch').find().toArray();
  const branchesMap = keyBy(branches, '_id');

  const col = con.collection('invoice');
  const pcol = con.collection('particular');

  const bulk = col.initializeUnorderedBulkOp();
  const pbulk = pcol.initializeUnorderedBulkOp();

  const oldInvsRaw = await col.aggregate([{
    $lookup: {
      from: 'payment',
      localField: '_id',
      foreignField: 'invoice',
      as: 'payments',
    },
  }, {
    $lookup: {
      from: 'particular',
      localField: '_id',
      foreignField: 'invoice',
      as: 'particulars',
    },
  }]).toArray();

  // console.log(oldInvsRaw[5]);

  const oldInvs = oldInvsRaw.map(inv => ({
    ...inv,
    particulars: inv.particulars.map((particular) => {
      const newParticular = {};
      newParticular.taxes = [];
      const {
        cgstRate,
        sgstRate,
        igstRate,
        rate,
        quantity,
      } = particular;
      if (cgstRate) newParticular.taxes.push({ taxType: taxTypesMap[`cgst_${cgstRate}`] });
      if (sgstRate) newParticular.taxes.push({ taxType: taxTypesMap[`sgst_${sgstRate}`] });
      if (igstRate) newParticular.taxes.push({ taxType: taxTypesMap[`igst_${igstRate}`] });
      newParticular.rate = rate;
      newParticular.quantity = quantity;
      newParticular.discountRate = 0;
      newParticular.discountAmount = 0;
      newParticular.details = particular._id;

      const particularDetails = { ...convertMeta(inv) };
      // particularDetails._id = particular._id;
      particularDetails.name = particular.name;
      particularDetails.description = particular.description;
      particularDetails.indicativePrice = particular.rate;
      particularDetails.organization = inv.organization;

      pbulk.find({ _id: particular._id }).updateOne(particularDetails);

      return newParticular;
    }),
  }));

  // console.log(oldInvs[0].particulars[0].taxes[0].taxType);

  const orgs = await con.collection('organization').find().toArray();
  const orgMaps = keyBy(orgs, '_id');

  oldInvs.forEach((oldInv) => {
    const {
      organization, client, taxInclusion, discountRate, tdsAmount,
    } = oldInv;
    const organizationBranch = orgMaps[oldInv.organization].defaultBranch;
    const clientBranch = orgMaps[oldInv.client].defaultBranch;

    const isGSTCompliant = typeof oldInv.isGSTCompliant === 'undefined' ? !!oldInv.serial : oldInv.isGSTCompliant;
    const isUnderComposition = typeof oldInv.isUnderComposition !== 'undefined' ? oldInv.isUnderComposition : false;
    const isUnderLUT = false;
    const isSameState = branchesMap[organizationBranch].state === branchesMap[clientBranch].state;

    const isTaxable = (
      isGSTCompliant
      && !isUnderComposition
      && !isUnderLUT
      && oldInv.generateSerial
    );

    const invInstance = new InvoiceService({
      particulars: oldInv.particulars,
      isTaxable,
      isSameState,
      taxInclusion,
      tdsAmount,
      tdsRate: undefined,
      discountAmount: undefined,
      discountRate,
    });

    const inv = { ...convertMeta(oldInv) };
    inv._id = oldInv._id;
    inv.organization = organization;
    inv.organizationBranch = organizationBranch;
    inv.client = client;
    inv.clientBranch = clientBranch;
    inv.payments = oldInv.payments.map(p => p._id);

    inv.raisedDate = new Date(oldInv.raisedDate);
    inv.dueDate = oldInv.dueDate ? new Date(oldInv.dueDate) : null;
    inv.cancelledDate = oldInv.cancelledDate ? new Date(oldInv.cancelledDate) : null;
    inv.closedDate = oldInv.closedDate ? new Date(oldInv.closedDate) : null;

    inv.isGSTCompliant = isGSTCompliant;
    inv.isUnderComposition = isUnderComposition;
    inv.isUnderLUT = isUnderLUT;
    inv.isTaxable = isTaxable;
    inv.isSameState = isSameState;
    inv.currency = 'INR';
    inv.includeQuantity = orgMaps[oldInv.organization].invoicePreferences.includeQuantity;
    inv.taxPerItem = oldInv.taxPerItem;
    inv.taxInclusion = taxInclusion;
    inv.serial = oldInv.serial ? oldInv.serial.trim() : null;
    inv.status = oldInv.status;
    inv.inlineComment = null;
    inv.attachments = [];
    inv.fileUrl = oldInv.fileUrl;

    // inv.particulars dependant on particulars
    inv.particulars = oldInv.particulars.map(particular => ({
      details: particular.details,
      rate: particular.rate,
      quantity: particular.quantity,
      discountRate: invInstance.getParticularDiscountRate(particular),
      discountAmount: invInstance.getParticularDiscountAmount(particular),
      taxes: invInstance.getParticularTaxes(particular),
      overallTaxRate: invInstance.getParticularOverallTaxRate(particular),
      taxAmount: invInstance.getParticularTaxAmount(particular),
      amount: invInstance.getParticularAmount(particular),
      taxableAmount: invInstance.getParticularTaxableAmount(particular),
      total: invInstance.getParticularTotal(particular),
    }));


    inv.discountRate = discountRate;
    inv.discountAmount = invInstance.getInvoiceDiscountAmount();
    inv.taxes = invInstance.getOverallTaxes();
    inv.overallTaxRate = invInstance.getOverallTaxRate();
    inv.taxAmount = invInstance.getTaxAmount();
    inv.amount = invInstance.getAmount();
    inv.taxableAmount = invInstance.getTaxableAmount();
    inv.total = invInstance.getTotal();
    inv.tdsRate = invInstance.getTdsRate();
    inv.tdsAmount = invInstance.getTdsAmount();
    inv.amountReceivable = invInstance.getAmountReceivable();
    inv.roundedTotal = invInstance.getRoundedTotal();
    inv.roundedAmountReceivable = invInstance.getRoundedAmountReceivable();

    bulk.find({ _id: inv._id }).updateOne(inv);
  });

  await bulk.execute();
  await pbulk.execute();
}

async function down() {
  console.log('the migration is irreversible');
}

module.exports = { up, down };
