const { Router } = require('express');

const router = Router();

router.get('/users', require('~controllers/user/find'));

router.post('/organization', require('~controllers/organization/create'));
router.get('/organizations', require('~controllers/organization/find'));

router.get('/expenses', require('~controllers/expense/find'));
router.post('/expense', require('~controllers/expense/create'));
router.patch('/expense', require('~controllers/expense/update'));

module.exports = router;
