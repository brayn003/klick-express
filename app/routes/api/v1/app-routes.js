const { declareApiRoutes } = require('~helpers/route-service');

const routes = [
  // users
  'get    /users                    user/find',
  'get    /user/me                  user/me',

  // location
  'get    /location/states          location-state/find',

  // organization branches
  'get    /organization/branches    organization-branch/find',
  'get    /organization/branch/:id  organization-branch/findOne',
  'post   /organization/branch      organization-branch/create',
  'patch  /organization/branch/:id  organization-branch/update',

  // organizations
  'get    /organizations            organization/find',
  'get    /organization/:id         organization/findOne',
  'post   /organization             organization/create',
  'delete /organization/:id         organization/deleteOne',
  'patch  /organization/:id         organization/update',

  // payment invoice
  'post   /invoice/payment          payment-invoice/create',

  // invoices
  'get    /invoices                 invoice/find',
  'post   /invoice                  invoice/create',
  'get    /invoice/:id              invoice/findOne',
  'patch  /invoice/:id              invoice/update',
  'get    /invoice/:id/view         invoice/view',
  'get    /invoice/:id/sync         invoice/sync',

  // expense categories
  'get    /expense/categories       expense-category/find',
  'post   /expense/category         expense-category/create',

  // payment expense
  'post   /expense/payment          payment-expense/create',

  // expense
  'get    /expense/:id              expense/findOne',
  'get    /expenses                 expense/find',
  'post   /expense                  expense/create',
  'patch  /expense/:id              expense/update',

  // dashboard
  'get    /dashboard/expense-category-pie           dashboard/expenseCategoryPie',
  'get    /dashboard/cashflow-bar                   dashboard/cashflowBar',
  'get    /dashboard/invoice-value                  dashboard/invoiceValue',
  'get    /dashboard/invoice-payment-remaining      dashboard/invoicePaymentRemaining',


  // upload
  'get    /upload/signed-url        upload/getSignedUrl',

  // taxtypes
  'get    /tax-types                tax-type/find',
];

module.exports = declareApiRoutes(routes);
