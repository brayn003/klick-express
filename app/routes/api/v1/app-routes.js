const { declareApiRoutes } = require('~helpers/route-service');

const routes = [
  // users
  'get    /users                    user/find',
  'get    /user/me                  user/me',

  // organization branches
  'get    /organization/branches    organization-branch/find',
  'post   /organization/branch      organization-branch/create',
  'patch  /organization/branch/:id  organization-branch/update',

  // organizations
  'get    /organizations            organization/find',
  'get    /organization/:id         organization/findOne',
  'post   /organization             organization/create',

  // invoices
  'get    /invoices                 invoice/find',
  'post   /invoice                  invoice/create',
  'get    /invoice/:id/view         invoice/view',
  'get    /invoice/:id/sync         invoice/sync',

  // expense categories
  'get    /expense/categories       expense-category/find',
  'post   /expense/category         expense-category/create',

  // expense
  'get    /expenses                 expense/find',
  'post   /expense                  expense/create',
  'patch  /expense                  expense/update',

  // upload
  'get    /upload/signed-url        upload/getSignedUrl',

  // taxtypes
  'get    /tax-types                tax-type/find',
];

module.exports = declareApiRoutes(routes);
