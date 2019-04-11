function transformError(e, code) {
  const err = {};
  err.code = code || 'BAD_REQUEST';
  err.messages = [e instanceof Error ? e.toString() : e];
  return err;
}

class ValidationError extends Error {
  constructor(message) {
    super(message);
    this.name = 'ValidationError';
  }
}

module.exports = { transformError, ValidationError };
