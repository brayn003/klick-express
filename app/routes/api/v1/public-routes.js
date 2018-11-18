const { Router } = require('express');

const router = Router();

router.post('/auth/register', require('~controllers/auth/register'));
router.post('/auth/login', require('~controllers/auth/login'));

router.post('/admin/login', require('~controllers/admin/login'));


module.exports = router;
