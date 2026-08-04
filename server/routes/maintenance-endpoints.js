const express = require('express');
const router = express.Router();
const prisma = require('../lib/prisma');

router.get('/keepalive', async (req, res) => {
  if (req.headers['x-api-key'] !== process.env.KEEP_ALIVE_SECRET) {
    return res.sendStatus(401);
  }

  try {
    await prisma.$queryRaw`SELECT 1`;

    res.status(200).json({
      status: 'awake',
      timestamp: new Date(),
    });
  } catch (error) {
    console.error('Keepalive failed:', error);

    res.status(500).json({
      status: 'error',
      message: 'Database connection failed',
    });
  }
});

module.exports = router;
