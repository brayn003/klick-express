const { Router } = require('express');

const router = Router();

router.get('/', (req, res) => res.send('Hello World! Express klick is here'));

router.use('/api/v1', require('./api/v1/admin-routes'));
router.use('/api/v1', require('./api/v1/public-routes'));

module.exports = router;
