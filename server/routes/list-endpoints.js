const express = require('express');
const router = express.Router();
const prisma = require('../lib/prisma');

// GET ALL LISTS FOR USER
router.get('/get-lists', async (req, res) => {
  if (!req.user) return res.status(401).send('Unauthorized');
  try {
    const lists = await prisma.list.findMany({
      where: {
        OR: [
          { ownerId: req.user.id },
          { members: { some: { userId: req.user.id } } },
        ],
      },
      include: {
        _count: { select: { movies: true } },
      },
      orderBy: { createdAt: 'asc' },
    });
    res.json(lists);
  } catch (err) {
    res.status(500).send('Error fetching lists: ' + err.message);
  }
});

// CREATE LIST
router.post('/create', async (req, res) => {
  if (!req.user) return res.status(401).send('Unauthorized');
  const { name } = req.body;
  if (!name?.trim()) return res.status(400).send('Name required');
  try {
    const list = await prisma.list.create({
      data: { name: name.trim(), ownerId: req.user.id },
    });
    res.status(201).json(list);
  } catch (err) {
    res.status(500).send('Error creating list: ' + err.message);
  }
});

module.exports = router;