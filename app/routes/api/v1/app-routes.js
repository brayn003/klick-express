const { Router } = require('express');

const router = Router();

router.get('/users', require('~controllers/user/find'));
router.get('/user/me', require('~controllers/user/me'));

router.get('/organizations', require('~controllers/organization/find'));
router.get('/organization/:id', require('~controllers/organization/findOne'));
router.post('/organization', require('~controllers/organization/create'));

router.get('/invoices', require('~controllers/invoice/find'));
router.post('/invoice', require('~controllers/invoice/create'));

router.get('/expenses', require('~controllers/expense/find'));
router.post('/expense', require('~controllers/expense/create'));
router.patch('/expense', require('~controllers/expense/update'));

module.exports = router;
