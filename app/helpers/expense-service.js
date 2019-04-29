const { ValidationError } = require('~helpers/extended-errors');

class ExpenseService {
  constructor(body) {
    this.body = body;

    if (this.body.amount <= 0) {
      throw new ValidationError('Amount should be more than 0');
    }
  }

  getModeledData() {
    const { amount, tdsAmount, ...rest } = this.body;
    return {
      ...rest,
      taxableAmount: amount,
      taxAmount: 0,
      total: amount,
      roundedTotal: Math.round(amount),
      taxes: [],
      tdsRate: ((tdsAmount / amount) * 100),
      tdsAmount,
      amountPayable: amount - tdsAmount,
      roundedAmountPayable: Math.round(amount - tdsAmount),
    };
  }
}

module.exports = ExpenseService;
