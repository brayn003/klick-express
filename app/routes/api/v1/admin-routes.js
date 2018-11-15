const { Router } = require('express');

const router = Router();

router.post('/', require('~controllers/admin/add'));
router.post('/invite-user', require('~controllers/invite/create'));

module.exports = router;
