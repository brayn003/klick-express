const { Router } = require('express');

const router = Router();

router.get('/get-admins', require('~controllers/admin/find'));

router.post('/invite-user', require('~controllers/invite/create'));

router.get('/users', require('~controllers/user/find'));

router.get('/organizations', require('~controllers/organization/find'));

router.get('/expenses', require('~controllers/expense/find'));
router.post('/expense', require('~controllers/expense/create'));
router.patch('/expense', require('~controllers/expense/update'));

module.exports = router;
