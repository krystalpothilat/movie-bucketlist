const express = require('express');
const router = express.Router();
const prisma = require('../lib/prisma');

// SAVE WHEEL
router.post('/save-wheel', async (req, res) => {
  try {
    const { name, movies } = req.body;
    const wheel = await prisma.wheel.create({
      data: {
        name,
        movies: {
          create: movies.map((m) => ({ title: m.title, color: m.color })),
        },
      },
      include: { movies: true },
    });
    res.status(200).json(wheel);
  } catch (err) {
    res.status(500).send('Error adding wheel: ' + err.message);
  }
});

// DELETE WHEEL
router.delete('/delete-wheel/:id', async (req, res) => {
  try {
    await prisma.wheel.delete({ where: { id: req.params.id } });
    res.status(200).send('Wheel deleted successfully');
  } catch (err) {
    res.status(500).send('Error deleting wheel');
  }
});

// UPDATE WHEEL
router.post('/update-wheel/:id', async (req, res) => {
  try {
    const { name, movies } = req.body;
    await prisma.wheelMovie.deleteMany({ where: { wheelId: req.params.id } });
    await prisma.wheel.update({
      where: { id: req.params.id },
      data: {
        name,
        movies: {
          create: movies.map((m) => ({ title: m.title, color: m.color })),
        },
      },
    });
    res.status(200).send('Wheel updated successfully');
  } catch (err) {
    res.status(500).send('Error updating wheel');
  }
});

// GET ALL WHEELS
router.get('/get-saved-wheels', async (req, res) => {
  try {
    const wheels = await prisma.wheel.findMany({ include: { movies: true } });
    res.status(200).json(wheels);
  } catch (err) {
    res.status(500).send('Server error fetching wheels');
  }
});

module.exports = router;