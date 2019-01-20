// const TaxType = require('~models/TaxType');
const sumBy = require('lodash/sumBy');
const isNil = require('lodash/isNil');


class InvoiceService {
  constructor({
    particulars = [],
    isTaxable,
    isSameState,
    taxInclusion,
  }) {
    this.particulars = particulars;
    this.isTaxable = isTaxable;
    this.isSameState = isSameState;
    this.taxInclusion = taxInclusion;

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
      discountAmount = +(
        (particular.rate * particular.quantity)
        * (particular.discountRate / 100)
      ).toFixed(2);
    }

    if (isNil(particular.discountAmount) && isNil(particular.discountRate)) {
      discountAmount = 0;
    }

    if (this.taxInclusion === 'exclusive') {
      return discountAmount;
    }

    if (this.taxInclusion === 'inclusive') {
      const taxRate = sumBy(particular.taxTypes, 'rate');
      return +((discountAmount * 100) / (100 + taxRate)).toFixed(2);
    }

    return 0;
  }

  getParticularDiscountRate(particular) {
    return +(
      (this.discountAmount(particular) * 100)
      / this.getTaxableAmount(particular)
    ).toFixed(2);
  }

  getParticularAmount(particular) {
    const discountAmount = this.getParticularDiscountAmount(particular);

    if (!this.isTaxable) {
      return +((particular.rate * particular.quantity) + discountAmount).toFixed(2);
    }

    if (this.isTaxable && this.taxInclusion === 'exclusive') {
      return +((particular.rate * particular.quantity) + discountAmount).toFixed(2);
    }

    if (this.isTaxable && this.taxInclusion === 'inclusive') {
      const total = (particular.quantity * particular.rate);
      const taxRate = sumBy(particular.taxTypes, 'rate');
      const taxableAmount = (total * 100) / (taxRate + 100);
      return +(taxableAmount + discountAmount).toFixed(2);
    }

    return null;
  }

  getParticularTaxableAmount(particular) {
    return (this.getParticularAmount(particular) - this.getParticularDiscountAmount(particular));
  }

  getParticularTaxAmount(particular) {
    const taxRate = sumBy(particular.taxTypes, 'rate');
    return +(this.getParticularTaxableAmount(particular) * (taxRate / 100)).toFixed(2);
  }

  getParticularTotal(particular) {
    return +(this.getParticularTaxableAmount(particular) + this.getParticularTaxAmount(particular));
  }

  getParticularTaxes(particular) {
    const taxableAmount = this.getParticularTaxableAmount(particular);
    return particular.taxTypes
      .map(taxType => ({ taxType, amount: +((taxType.rate / 100) * taxableAmount).toFixed(2) }));
  }

  getTaxes() {
    const taxesMap = this.particulars.reduce((agg, particular) => {
      const particularTaxes = this.getParticularTaxes(particular);
      return particularTaxes.reduce((agg2, particularTax) => {
        const agg3 = agg2;
        const key = `${particularTax.taxType.type}`;
        if (typeof agg3[key] === 'undefined') {
          agg3[key] = particularTax;
        } else {
          agg3[key].amount = +(agg3[key].amount + particularTax.amount).toFixed(2);
        }
        return agg3;
      }, agg);
    }, {});
    return Object.values(taxesMap);
  }

  getTdsAmount() {
    if (!isNil(this.tdsAmount)) {
      return +(this.tdsAmount).toFixed();
    }

    if (isNil(this.tdsAmount) && !isNil(this.tdsRate)) {
      return +(this.getTotal() * (this.tdsRate / 100)).toFixed(2);
    }

    return 0;
  }

  getTdsRate() {
    if (!isNil(this.tdsAmount)) {
      return +((this.tdsAmount * 100) / this.getTotal()).toFixed(2);
    }

    if (isNil(this.tdsAmount) && !isNil(this.tdsRate)) {
      return +(this.tdsRate).toFixed(2);
    }

    return 0;
  }

  getAmount() {
    return +sumBy(this.particulars, this.getParticularAmount).toFixed(2);
  }

  getDiscountAmount() {
    return +sumBy(this.particulars, this.getParticularDiscountAmount).toFixed(2);
  }

  getTaxableAmount() {
    return +sumBy(this.particulars, this.getParticularTaxableAmount).toFixed(2);
  }

  getTaxAmount() {
    return +sumBy(this.particulars, this.getParticularTaxAmount).toFixed(2);
  }

  getTotal() {
    return +sumBy(this.particulars, this.getParticularTotal).toFixed(2);
  }

  getRoundedTotal() {
    return Math.round(this.getTotal());
  }

  getAmountReceivable() {
    return +(this.getTotal() - this.getTdsAmount()).toFixed(2);
  }

  getRoundedAmountReceivable() {
    return Math.round(this.getAmountReceivable());
  }
}

module.exports = InvoiceService;
