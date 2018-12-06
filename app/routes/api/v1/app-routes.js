const { Router } = require('express');

const router = Router();

router.get('/users', require('~controllers/user/find'));

router.post('/organization', require('~controllers/organization/create'));
router.get('/organizations', require('~controllers/organization/find'));

module.exports = router;
