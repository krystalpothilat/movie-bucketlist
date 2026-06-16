const express = require('express');
const router = express.Router();
const passport = require('../lib/passport');
const bcrypt = require('bcrypt');
const prisma = require('../lib/prisma');

const CLIENT_URL =
  process.env.CLIENT_URL || 'https://movie-bucketlist.vercel.app';

// Google OAuth
router.get(
  '/google',
  passport.authenticate('google', {
    scope: ['profile', 'email'],
  })
);

router.get(
  '/google/callback',
  passport.authenticate('google', {
    failureRedirect: `${CLIENT_URL}/login?error=google`,
  }),
  (req, res) => {
    res.redirect(CLIENT_URL);
  }
);

// Password login
router.post('/login', (req, res, next) => {
  passport.authenticate('local', (err, user, info) => {
    if (err)
      return res.status(500).json({ success: false, message: 'Server error.' });
    if (!user)
      return res
        .status(401)
        .json({
          success: false,
          message: info?.message || 'Invalid credentials.',
        });

    req.login(user, (err) => {
      if (err)
        return res
          .status(500)
          .json({ success: false, message: 'Server error.' });
      res.json({
        success: true,
        user: { id: user.id, name: user.name, email: user.email },
      });
    });
  })(req, res, next);
});

// Password register
router.post('/register', async (req, res) => {
  const { email, name, password } = req.body;
  try {
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return res.status(400).json({
        success: false,
        message:
          existing.authProvider === 'google'
            ? 'This email is registered with Google. Please log in with Google.'
            : 'An account with this email already exists.',
      });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { email, name, passwordHash, authProvider: 'password' },
    });

    req.login(user, (err) => {
      if (err) return res.status(500).json({ success: false });
      res.json({
        success: true,
        user: { id: user.id, name: user.name, email: user.email },
      });
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false });
  }
});

// Get current user
router.get('/me', (req, res) => {
  if (!req.user) return res.json({ user: null });
  res.json({
    user: { id: req.user.id, name: req.user.name, email: req.user.email },
  });
});

// Logout
router.post('/logout', (req, res) => {
  req.logout(() => {
    res.json({ success: true });
  });
});

module.exports = router;
