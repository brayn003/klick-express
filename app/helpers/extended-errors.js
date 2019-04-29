class ValidationError extends Error {
  constructor(message) {
    super(message);
    this.name = 'ValidationError';
    this.code = 400;
  }
}

class ForbiddenError extends Error {
  constructor(message) {
    super(message);
    this.name = 'ForbiddenError';
    this.code = 403;
  }
}

class AuthenticationError extends Error {
  constructor(message) {
    super(message);
    this.name = 'AuthenticationError';
    this.code = 401;
  }
}

class MissingError extends Error {
  constructor(message) {
    super(message);
    this.name = 'MissingError';
    this.code = 404;
  }
}

module.exports = {
  ValidationError,
  ForbiddenError,
  AuthenticationError,
  MissingError,
};
