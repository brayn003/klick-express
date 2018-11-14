const { Router } = require('express');

const router = Router();

router.get('/', (req, res) => res.send('Hello World! 1 2 444'));
router.use('/api/v1', require('./api-v1'));

module.exports = router;
