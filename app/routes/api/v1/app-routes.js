const { Router } = require('express');

const router = Router();

router.get('/user', require('~controllers/user/find'));

module.exports = router;
