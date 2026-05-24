const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const User = require('../models/User');

router.post('/', async (req, res) => {
  const { username, password } = req.body;

  try {
    console.log('in login');
    const user = await User.findOne({ username });
    if (!user) {
      return res.json({ success: false });
    }
    console.log(user);

    console.log(user.password);
    console.log(password);
    const match = await bcrypt.compare(password, user.password);

    if (!match) {
      return res.json({ success: false });
    }

    return res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false });
  }
});

module.exports = router;
