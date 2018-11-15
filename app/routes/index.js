const { Router } = require('express');
const isAuthenticated = require('~middlewares/is-authenticated');
const isAdmin = require('~middlewares/is-admin');


const router = Router();

router.get('/', (req, res) => res.send('Hello World! Express klick is here'));

router.use('/api/v1/admin', [isAuthenticated, isAdmin], require('./api/v1/admin-routes'));
router.use('/api/v1/app', [isAuthenticated], require('./api/v1/app-routes'));
router.use('/api/v1', require('./api/v1/public-routes'));

module.exports = router;
