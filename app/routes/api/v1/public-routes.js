const { Router } = require('express');

const router = Router();

router.post('/auth/register', require('~controllers/auth/register'));
router.post('/auth/login', require('~controllers/auth/login'));
router.post('/auth/verify-token', require('~controllers/auth/verifyToken'));

router.post('/admin/login', require('~controllers/admin/login'));
router.post('/admin/verify-token', require('~controllers/admin/verify-token'));
router.post('/admin/add-admin', require('~controllers/admin/add'));


module.exports = router;
