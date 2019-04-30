const { ValidationError } = require('~helpers/extended-errors');

class ExpenseService {
  constructor({ amount, tdsAmount, taxInclusion }) {
    this.amount = amount;
    this.tdsAmount = tdsAmount;
    this.taxInclusion = taxInclusion;

    if (this.amount <= 0) {
      throw new ValidationError('Amount should be more than 0');
    }

    this.getTdsAmount = this.getTdsAmount.bind(this);
  }

  getTdsAmount() {
    return this.tdsAmount;
  }

  getModeledData() {
    const tdsAmount = this.getTdsAmount();
    return {
      taxInclusion: 'inclusive',
      taxableAmount: this.amount,
      taxAmount: 0,
      total: this.amount,
      roundedTotal: Math.round(this.amount),
      taxes: [],
      tdsRate: ((tdsAmount / this.amount) * 100),
      tdsAmount,
      amountPayable: this.amount - tdsAmount,
      roundedAmountPayable: Math.round(this.amount - tdsAmount),
    };
  }
}

module.exports = ExpenseService;
