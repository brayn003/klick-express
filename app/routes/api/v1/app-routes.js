const { Router } = require('express');

const router = Router();

router.get('/users', require('~controllers/user/find'));
router.post('/organization', require('~controllers/organization/create'));

module.exports = router;
