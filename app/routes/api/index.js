const { Router } = require('express');
const isAuthenticated = require('~middlewares/is-authenticated');
const isAdmin = require('~middlewares/is-admin');

const router = Router();

router.use('/v1', require('./v1/public-routes'));
router.use('/v1/admin', [isAdmin], require('./v1/admin-routes'));
router.use('/v1/app', [isAuthenticated], require('./v1/app-routes'));

module.exports = router;
