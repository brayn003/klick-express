const { Router } = require('express');
const apiRoutes = require('./api');

const router = Router();

router.get('/', (req, res) => res.send('Hello World! Express klick is here'));

router.use('/api', async (req, res, ...args) => {
  try {
    await apiRoutes(req, res, ...args);
  } catch (err) {
    if (err instanceof Error) {
      return res.status(500).json({
        code: 'E_SERVER_ERROR',
        messages: [
          err.message,
          err.stack,
        ],
      });
    }
    if (typeof err === 'string') {
      return res.status(400).json({
        code: 'E_BAD_REQUEST',
        messages: [err],
      });
    }
    return res.status(500).json({
      code: 'E_SERVER_ERROR',
      messages: ['Server is temporarily unavailable'],
    });
  }
});

module.exports = router;
