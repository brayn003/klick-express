const Decimal = require('decimal.js');
// import get from 'lodash/get';

function sumBy(collection, iterator) {
  return collection.reduce((agg, el) => {
    const value = iterator(el);
    return agg.add(value);
  }, new Decimal(0)).valueOf();
}

function toDecimalPlaces(num, decimalPlaces = 2) {
  return new Decimal(num).toDP(decimalPlaces);
}

module.exports = {
  sumBy,
  toDecimalPlaces,
  toDP: toDecimalPlaces,
};
