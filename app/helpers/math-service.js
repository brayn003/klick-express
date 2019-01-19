import Decimal from 'decimal.js';
// import get from 'lodash/get';

function sumBy(collection, iterator) {
  return collection.reduce((agg, el) => {
    const value = iterator(el);
    return agg.add(value);
  }, new Decimal(0)).valueOf();
}

module.exports = {
  sumBy,
};
