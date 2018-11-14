const { validationResult } = require('express-validator/check');
const isUndefined = require('lodash/isUndefined');
const isArray = require('lodash/isArray');

function errorFormatter({ param, msg }) {
  return `${param}: ${msg}`;
}

function validateResult(req, res, next) {
  const errors = validationResult(req).formatWith(errorFormatter);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      code: 'EPCHECK',
      messages: errors.array(),
    });
  }
  return next();
}

function validateParams(validationChecks, ...rest) {
  if (isUndefined(validationChecks)) {
    return [...rest];
  }
  if (isArray(validationChecks)) {
    return [...validationChecks, validateResult, ...rest];
  }
  return [validationChecks, validateResult, ...rest];
}

module.exports = { validateParams };
