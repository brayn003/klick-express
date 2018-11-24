const { Router } = require('express');

const router = Router();

router.get('/users', require('~controllers/user/find'));

module.exports = router;
