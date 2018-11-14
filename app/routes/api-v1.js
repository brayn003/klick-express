const { Router } = require('express');

const router = Router();

router.post('/auth/register', require('../controllers/auth/register'));
router.post('/auth/login', require('../controllers/auth/login'));

router.post('/invite', require('../controllers/invite/create'));

module.exports = router;
