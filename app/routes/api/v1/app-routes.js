const { Router } = require('express');

const router = Router();

router.get('/users', require('~controllers/user/find'));
router.get('/user/me', require('~controllers/user/me'));

router.get('/organization/branches', require('~controllers/organization-branch/find'));
router.post('/organization/branch', require('~controllers/organization-branch/create'));
router.patch('/organization/branch/:id', require('~controllers/organization-branch/update'));

router.get('/organizations', require('~controllers/organization/find'));
router.get('/organization/:id', require('~controllers/organization/findOne'));
router.post('/organization', require('~controllers/organization/create'));

router.get('/invoices', require('~controllers/invoice/find'));
router.post('/invoice', require('~controllers/invoice/create'));
router.get('/invoice/:id/view', require('~controllers/invoice/view'));
router.get('/invoice/:id/sync', require('~controllers/invoice/sync'));

router.get('/expense/categories', require('~controllers/expense/find'));
router.post('/expense/category', require('~controllers/expense/create'));

router.get('/expenses', require('~controllers/expense/find'));
router.post('/expense', require('~controllers/expense/create'));
router.patch('/expense', require('~controllers/expense/update'));

router.get('/upload/signed-url', require('~/controllers/upload/getSignedUrl'));

router.get('/tax-types', require('~/controllers/tax-type/find'));

module.exports = router;
