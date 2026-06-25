const express = require('express');
const router = express.Router();
const prisma = require('../lib/prisma');

// GET ALL MOVIES
router.get('/get-movies', async (req, res) => {
  if (!req.user) return res.status(401).send('Unauthorized');
  try {
    const listMovies = await prisma.listMovie.findMany({
      where: {
        list: {
          OR: [
            { ownerId: req.user.id },
            { members: { some: { userId: req.user.id } } },
          ],
        },
      },
    });

    const ratings = await prisma.userMovieRating.findMany({
      where: { userId: req.user.id },
    });
    const ratingMap = Object.fromEntries(ratings.map((r) => [r.title, r]));

    const movies = listMovies.map((m) => ({
      id: m.id,
      title: m.title,
      image: m.poster || null,
      genre: m.genre || [],
      year: m.year,
      seen: ratingMap[m.title]?.seen ?? false,
      rating: ratingMap[m.title]?.rating ?? null,
      notes: ratingMap[m.title]?.notes ?? null,
      description: null,
      imdbLink: null,
      rank: null,
    }));

    res.json(movies);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error fetching movies');
  }
});

// DELETE MOVIE
router.post('/delete-movie', async (req, res) => {
  if (!req.user) return res.status(401).send('Unauthorized');
  const { title } = req.body;
  try {
    await prisma.listMovie.deleteMany({
      where: {
        title,
        list: {
          OR: [
            { ownerId: req.user.id },
            { members: { some: { userId: req.user.id } } },
          ],
        },
      },
    });
    res.status(200).send('Movie deleted successfully');
  } catch (err) {
    res.status(500).send('Error deleting movie');
  }
});

// TOGGLE SEEN
router.post('/update-seen', async (req, res) => {
  if (!req.user) return res.status(401).send('Unauthorized');
  const { title } = req.body;
  try {
    const existing = await prisma.userMovieRating.findUnique({
      where: { userId_title: { userId: req.user.id, title } },
    });
    if (existing) {
      await prisma.userMovieRating.update({
        where: { userId_title: { userId: req.user.id, title } },
        data: { seen: !existing.seen },
      });
    } else {
      await prisma.userMovieRating.create({
        data: { userId: req.user.id, title, seen: true },
      });
    }
    res.status(200).send('Movie updated successfully');
  } catch (err) {
    res.status(500).send('Error updating movie');
  }
});

// ADD MOVIE
router.post('/add-movie', async (req, res) => {
  if (!req.user) return res.status(401).send('Unauthorized');
  const { title, genre, image, year } = req.body;
  try {
    let list = await prisma.list.findFirst({ where: { ownerId: req.user.id } });
    if (!list) {
      list = await prisma.list.create({
        data: { name: 'My Movie List', ownerId: req.user.id },
      });
    }
    const movie = await prisma.listMovie.create({
      data: {
        listId: list.id,
        title,
        genre: genre || [],
        year: year || null,
        poster: image || null,
        addedById: req.user.id,
      },
    });
    res.status(201).json(movie);
  } catch (err) {
    res.status(500).send('Error adding movie: ' + err.message);
  }
});

// UPDATE RATING FOR MOVIE
router.post('/update-rating', async (req, res) => {
  if (!req.user) return res.status(401).send('Unauthorized');
  const { title, rating } = req.body;
  try {
    await prisma.userMovieRating.upsert({
      where: { userId_title: { userId: req.user.id, title } },
      update: { rating },
      create: { userId: req.user.id, title, rating },
    });
    res.status(200).send('Rating updated');
  } catch (err) {
    res.status(500).send('Error updating rating');
  }
});

// UPDATE NOTES FOR MOVIE
router.post('/update-notes', async (req, res) => {
  if (!req.user) return res.status(401).send('Unauthorized');
  const { title, notes } = req.body;
  try {
    await prisma.userMovieRating.upsert({
      where: { userId_title: { userId: req.user.id, title } },
      update: { notes },
      create: { userId: req.user.id, title, notes },
    });
    res.status(200).send('Notes updated');
  } catch (err) {
    res.status(500).send('Error updating notes');
  }
});

module.exports = router;
