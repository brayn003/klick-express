const { Router } = require('express');
const apiRoutes = require('./api');

const router = Router();

router.get('/', (req, res) => res.send('Hello World! Express klick is here'));

router.use('/api', apiRoutes);

module.exports = router;
