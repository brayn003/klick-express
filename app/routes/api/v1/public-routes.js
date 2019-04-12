const { declareApiRoutes } = require('~helpers/route-service');

const routes = [
  // public auth
  'post   /auth/register        auth/register',
  'post   /auth/login           auth/login',
  'post   /auth/verify-token    auth/verifyToken',

  // admin auth
  'post   /admin/login          admin/login',
  'post   /admin/verify-token   admin/verifyToken',
  'post   /admin/add-admin      admin/add',
];

module.exports = declareApiRoutes(routes);
