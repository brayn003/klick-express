const jwt = require('jsonwebtoken');

function verifyJWT(token, secret) {
  return new Promise((resolve, reject) => {
    jwt.verify(token, secret, (err, decodedData) => {
      if (err || !decodedData) {
        reject(err);
      } else {
        resolve(decodedData);
      }
    });
  });
}

function createJWT(details, secret, options) {
  return new Promise((resolve, reject) => {
    jwt.sign(details, secret, options, (err, token) => {
      if (err || !token) {
        reject(err);
      } else {
        resolve(token);
      }
    });
  });
}

module.exports = {
  verifyJWT,
  createJWT,
};
