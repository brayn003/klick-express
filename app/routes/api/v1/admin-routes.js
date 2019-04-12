const { declareApiRoutes } = require('~helpers/route-service');

const routes = [
  // admins
  'get    /get-admins       admin/find',

  // invites
  'post   /invite-user      invite/create',

  // users
  'get    /users            user/find',

  // organizations
  'get    /organizations    organization/find',

  // expenses
  'get    /expenses         expense/find',
  'post   /expense          expense/create',
  'patch  /expense          expense/update',
];

module.exports = declareApiRoutes(routes);
