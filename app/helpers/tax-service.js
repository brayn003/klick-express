function validateTaxes(taxTypes, { isSameState, isTaxable }) {
  if (!isTaxable) {
    if (taxTypes || taxTypes.length > 0) {
      throw new Error('Tax defined for a non-taxable invoice');
    }
  }

  if (isSameState) {
    let commonRate = null;
    const cgstIndex = taxTypes.findIndex((t) => {
      const isCgst = t.type.includes('cgst');
      if (isCgst) {
        commonRate = t.rate;
      }
      return isCgst;
    });
    const sgstIndex = taxTypes.findIndex(t => t.type.includes('sgst') && t.rate === commonRate);
    if (cgstIndex === -1) {
      throw new Error('CGST is missing for same state');
    }
    if (sgstIndex === -1) {
      throw new Error('SGST is missing for same state');
    }
    if (taxTypes.length > 2) {
      throw new Error('More than 2 taxes not applicable');
    }
  }

  if (!isSameState) {
    const igstIndex = taxTypes.findIndex(t => t.type.includes('igst'));
    if (igstIndex === -1) {
      throw new Error('IGST is missing for inter-state');
    }
  }
}

function validateParticulars(particulars, options) {
  particulars.forEach((particular) => {
    validateTaxes(particular.taxTypes, options);
  });
}

module.exports = { validateTaxes, validateParticulars };
