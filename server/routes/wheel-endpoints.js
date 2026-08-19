const express = require('express');
const router = express.Router();

const prisma = require('../lib/prisma');

// SAVE WHEEL
router.post('/save-wheel', async (req, res) => {
  if (!req.user) return res.status(401).send('Unauthorized');

  try {
    const { name, movies } = req.body;

    let list = await prisma.list.findFirst({
      where: {
        ownerId: req.user.id,
      },
    });

    if (!list) {
      list = await prisma.list.create({
        data: {
          name: 'My Movie List',
          ownerId: req.user.id,
          members: {
            create: {
              userId: req.user.id,
              role: 'admin',
            },
          },
        },
      });
    }

    const wheelMovies = (movies || [])
      .filter((m) => m.movieId)
      .map((m) => ({ movieId: m.movieId, color: m.color }));

    const wheel = await prisma.wheel.create({
      data: {
        name: name?.trim() || 'Untitled Wheel',
        listId: list.id,
        movies: {
          create: wheelMovies,
        },
      },
      include: {
        movies: {
          include: {
            movie: true,
          },
        },
      },
    });

    res.status(200).json(wheel);
  } catch (err) {
    console.error('Error adding wheel:', err);
    res.status(500).send('Error adding wheel: ' + err.message);
  }
});

// DELETE WHEEL
router.delete('/delete-wheel/:id', async (req, res) => {
  if (!req.user) return res.status(401).send('Unauthorized');

  try {
    const wheel = await prisma.wheel.findUnique({
      where: {
        id: req.params.id,
      },
      include: {
        list: true,
      },
    });

    if (!wheel) {
      return res.status(404).send('Wheel not found');
    }

    if (wheel.list.ownerId !== req.user.id) {
      return res.status(403).send('Only the owner can delete wheels');
    }

    await prisma.wheel.delete({
      where: {
        id: req.params.id,
      },
    });

    res.status(200).send('Wheel deleted successfully');
  } catch (err) {
    console.error('Error deleting wheel:', err);
    res.status(500).send('Error deleting wheel');
  }
});

// UPDATE WHEEL
router.post('/update-wheel/:id', async (req, res) => {
  if (!req.user) return res.status(401).send('Unauthorized');

  try {
    const { name, movies } = req.body;

    const wheel = await prisma.wheel.findUnique({
      where: {
        id: req.params.id,
      },
      include: {
        list: true,
      },
    });

    if (!wheel) {
      return res.status(404).send('Wheel not found');
    }

    if (wheel.list.ownerId !== req.user.id) {
      return res.status(403).send('Only the owner can edit wheels');
    }

    await prisma.wheelMovie.deleteMany({
      where: {
        wheelId: req.params.id,
      },
    });

    const wheelMovies = (movies || [])
      .filter((m) => m.movieId)
      .map((m) => ({ movieId: m.movieId, color: m.color }));

    const updatedWheel = await prisma.wheel.update({
      where: {
        id: req.params.id,
      },
      data: {
        name: name?.trim() || 'Untitled Wheel',
        movies: {
          create: wheelMovies,
        },
      },
      include: {
        movies: {
          include: {
            movie: true,
          },
        },
      },
    });

    res.status(200).json(updatedWheel);
  } catch (err) {
    console.error('Error updating wheel:', err);
    res.status(500).send('Error updating wheel');
  }
});

// GET ALL WHEELS
router.get('/get-saved-wheels', async (req, res) => {
  if (!req.user) return res.status(401).send('Unauthorized');

  try {
    const wheels = await prisma.wheel.findMany({
      where: {
        list: {
          ownerId: req.user.id,
        },
      },
      include: {
        movies: {
          include: {
            movie: true,
          },
        },
      },
    });

    res.status(200).json(wheels);
  } catch (err) {
    console.error('Server error fetching wheels:', err);
    res.status(500).send('Server error fetching wheels');
  }
});

module.exports = router;
