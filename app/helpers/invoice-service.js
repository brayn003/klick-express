// const TaxType = require('~models/TaxType');
const sumBy = require('lodash/sumBy');
const isNil = require('lodash/isNil');


class InvoiceService {
  constructor({
    particulars = [],
    isTaxable,
    isSameState,
    taxInclusion,
    discountAmount,
    discountRate,
  }) {
    this.particulars = particulars;
    this.isTaxable = isTaxable;
    this.isSameState = isSameState;
    this.taxInclusion = taxInclusion;
    this.discountAmount = discountAmount;
    this.discountRate = discountRate;

    // method bindings
    this.getParticularDiscountAmount = this.getParticularDiscountAmount.bind(this);
    this.getParticularAmount = this.getParticularAmount.bind(this);
    this.getParticularTaxableAmount = this.getParticularTaxableAmount.bind(this);
    this.getParticularTaxes = this.getParticularTaxes.bind(this);
    this.getParticularTaxAmount = this.getParticularTaxAmount.bind(this);
    this.getParticularTotal = this.getParticularTotal.bind(this);
  }

  getParticularDiscountAmount(particular) {
    let { discountAmount } = particular;

    if (isNil(particular.discountAmount) && !isNil(particular.discountRate)) {
      discountAmount = (particular.rate * particular.quantity)
        * (particular.discountRate / 100);
    }

    if (isNil(particular.discountAmount) && isNil(particular.discountRate)) {
      discountAmount = 0;
    }

    if (this.taxInclusion === 'exclusive') {
      return discountAmount;
    }

    if (this.taxInclusion === 'inclusive') {
      const taxRate = sumBy(particular.taxTypes, 'rate');
      return (discountAmount * 100) / (100 + taxRate);
    }

    return 0;
  }

  getParticularDiscountRate(particular) {
    return (this.discountAmount(particular) * 100) / this.getTaxableAmount(particular);
  }

  getParticularAmount(particular) {
    const discountAmount = this.getParticularDiscountAmount(particular);

    if (!this.isTaxable) {
      return (particular.rate * particular.quantity) + discountAmount;
    }

    if (this.isTaxable && this.taxInclusion === 'exclusive') {
      return (particular.rate * particular.quantity) + discountAmount;
    }

    if (this.isTaxable && this.taxInclusion === 'inclusive') {
      const total = (particular.quantity * particular.rate);
      const taxRate = sumBy(particular.taxTypes, 'rate');
      const taxableAmount = (total * 100) / (taxRate + 100);
      return taxableAmount + discountAmount;
    }

    return null;
  }

  getParticularTaxableAmount(particular) {
    return (this.getParticularAmount(particular) - this.getParticularDiscountAmount(particular));
  }

  getParticularTaxAmount(particular) {
    const taxRate = sumBy(particular.taxTypes, 'rate');
    return this.getParticularTaxableAmount(particular) * (taxRate / 100);
  }

  getParticularTotal(particular) {
    return this.getParticularTaxableAmount(particular) + this.getParticularTaxAmount(particular);
  }

  getParticularTaxes(particular) {
    const taxableAmount = this.getParticularTaxableAmount(particular);
    return particular.taxTypes
      .map(taxType => ({ taxType, amount: (taxType.rate / 100) * taxableAmount }));
  }

  getAggregatedParticularTaxes() {
    const taxesMap = this.particulars.reduce((agg, particular) => {
      const particularTaxes = this.getParticularTaxes(particular);
      return particularTaxes.reduce((agg2, particularTax) => {
        const agg3 = agg2;
        const key = `${particularTax.taxType.type}`;
        if (typeof agg3[key] === 'undefined') {
          agg3[key] = particularTax;
        } else {
          agg3[key].amount += particularTax.amount;
        }
        return agg3;
      }, agg);
    }, {});
    return Object.values(taxesMap);
  }

  getTdsAmount() {
    if (!isNil(this.tdsAmount)) {
      return this.tdsAmount;
    }

    if (isNil(this.tdsAmount) && !isNil(this.tdsRate)) {
      return this.getTotal() * (this.tdsRate / 100);
    }

    return 0;
  }

  getTdsRate() {
    if (!isNil(this.tdsAmount)) {
      return (this.tdsAmount * 100) / this.getTotal();
    }

    if (isNil(this.tdsAmount) && !isNil(this.tdsRate)) {
      return this.tdsRate;
    }

    return 0;
  }

  getParticularTotalDiscountAmount() {
    return sumBy(this.particulars, this.getParticularDiscountAmount);
  }

  getInvoiceDiscountAmount() {
    let { discountAmount } = this;

    if (isNil(this.discountAmount) && !isNil(this.discountRate)) {
      discountAmount = this.getAmount() * (this.discountRate / 100);
    }

    if (isNil(this.discountAmount) && isNil(this.discountAmount)) {
      discountAmount = 0;
    }

    if (this.taxInclusion === 'exclusive') {
      return discountAmount;
    }

    if (this.taxInclusion === 'inclusive') {
      return (discountAmount * 100) / (100 + this.getOverallTaxRate());
    }

    return 0;
  }

  getTotalDiscountAmount() {
    return this.getInvoiceDiscountAmount() + this.getParticularTotalDiscountAmount();
  }

  getAmount() {
    return sumBy(this.particulars, this.getParticularTaxableAmount);
  }

  getOverallTaxRate() {
    const totalParticularTaxAmount = sumBy(this.getAggregatedParticularTaxes(), 'amount');
    return (totalParticularTaxAmount * 100)
      / sumBy(this.particulars, this.getParticularTaxableAmount);
  }

  getTaxAmount() {
    return this.getTaxableAmount() * (this.getOverallTaxRate() / 100);
  }

  getTaxableAmount() {
    return this.getAmount() - this.getTotalDiscountAmount();
  }

  getTotal() {
    return this.getTaxableAmount() + this.getTaxAmount();
  }

  getRoundedTotal() {
    return Math.round(this.getTotal());
  }

  getAmountReceivable() {
    return this.getTotal() - this.getTdsAmount();
  }

  getRoundedAmountReceivable() {
    return Math.round(this.getAmountReceivable());
  }
}

module.exports = InvoiceService;
