const { Router } = require('express');

const router = Router();

router.post('/add-admin', require('~controllers/admin/add'));
router.get('/get-admins', require('~controllers/admin/find'));

router.post('/invite-user', require('~controllers/invite/create'));

router.get('/users', require('~controllers/user/find'));

module.exports = router;
