// const TaxType = require('~models/TaxType');
const sumBy = require('lodash/sumBy');

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
    this.getParticularTaxableAmount = this.getParticularTaxableAmount.bind(this);
    this.getParticularTaxes = this.getParticularTaxes.bind(this);
  }

  getParticularTaxableAmount(particular) {
    if (!this.isTaxable) {
      return +(particular.rate * particular.quantity).toFixed(2);
    }

    if (this.isTaxable && this.taxInclusion === 'exclusive') {
      return +(particular.rate * particular.quantity).toFixed(2);
    }

    if (this.isTaxable && this.taxInclusion === 'inclusive') {
      const total = particular.quantity * particular.rate;
      const taxRate = sumBy(particular.taxTypes, 'rate');
      return +((total * 100) / (taxRate + 100)).toFixed(2);
    }

    return null;
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

  getTaxableAmount() {
    return sumBy(this.particulars, this.getParticularTaxableAmount);
  }

  getTaxAmount() {
    return sumBy(this.getTaxes(), 'amount');
  }

  getTotal() {
    return this.getTaxableAmount() + this.getTaxAmount();
  }

  getRoundedTotal() {
    return Math.round(this.getTotal());
  }
}

module.exports = InvoiceService;
