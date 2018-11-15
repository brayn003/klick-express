const { Router } = require('express');

const router = Router();

router.post('/admin', require('~controllers/admin/add'));
router.post('/admin/invite-user', require('~controllers/invite/create'));

module.exports = router;
