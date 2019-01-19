const isNil = require('lodash/isNil');
const { sumBy } = require('helpers/math-service');

// function calculateDiscount(total, discountValue, discountType = 'rate') {
//   if()
// }

export default class InvoiceService {
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
  }

  getParticularAmount(particular) {
    if (!this.isTaxable) {
      return particular.rate * particular.quantity;
    }

    if (this.isTaxable && this.taxInclusion === 'exclusive') {
      return particular.rate * particular.quantity;
    }

    if (this.isTaxable && this.taxInclusion === 'inclusive') {
      const {
        taxRate, discountRate, discountAmount, rate, quantity,
      } = particular;
      const grandTotal = quantity * rate;
      if (isNil(discountAmount)) {
        return (grandTotal * 10000) / ((100 + taxRate) * (100 - discountRate));
      }
      return ((grandTotal * 100) / (100 + taxRate)) * discountAmount;
    }

    return null;
  }

  getParticularDiscountAmount(particular) {
    const { discountRate, discountAmount } = particular;
    const taxableAmount = this.getDiscountAmount(particular);
    if (isNil(discountAmount)) {
      return (discountRate / 100) * taxableAmount;
    }
    return discountAmount;
  }

  getAmount() {
    return sumBy(this.particulars, this.getParticularAmount);
  }

  getDiscountAmount() {
    if (!this.isTaxable) {

    }
  }
}
