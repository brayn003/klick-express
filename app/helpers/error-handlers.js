function transformError(e, code) {
  const err = {};
  err.code = code || 'BAD_REQUEST';
  err.messages = [e instanceof Error ? e.toString() : e];
  return err;
}

module.exports = { transformError };
