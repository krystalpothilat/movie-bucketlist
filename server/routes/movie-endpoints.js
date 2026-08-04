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
      addedAt: m.addedAt,
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

  const { listId, title } = req.body;

  try {
    const listMovie = await prisma.listMovie.findFirst({
      where: {
        listId,
        title,
        list: {
          OR: [
            { ownerId: req.user.id },
            { members: { some: { userId: req.user.id } } },
          ],
        },
      },
    });

    if (!listMovie) {
      return res.status(404).send('Movie not found');
    }

    await prisma.listMovie.delete({
      where: {
        id: listMovie.id,
      },
    });

    res.status(200).send('Deleted');
  } catch (err) {
    console.error(err);
    res.status(500).send('Delete failed');
  }
});

// ADD MOVIE
router.post('/add-movie', async (req, res) => {
  if (!req.user) return res.status(401).send('Unauthorized');

  const { listId, title, genre, image, year, tmdbId } = req.body;

  try {
    const list = await prisma.list.findFirst({
      where: {
        id: listId,
        OR: [
          { ownerId: req.user.id },
          { members: { some: { userId: req.user.id } } },
        ],
      },
    });

    if (!list) {
      return res.status(403).send('No access to this list');
    }

    const movie = await prisma.listMovie.create({
      data: {
        listId,
        title,
        genre: genre || [],
        year: year || null,
        poster: image || null,
        tmdbId,
        addedById: req.user.id,
      },
    });

    res.status(201).json(movie);
  } catch (err) {
    console.error(err);
    res.status(500).send('Error adding movie');
  }
});

// UPDATE USER DATA
router.post('/update-user-data', async (req, res) => {
  if (!req.user) return res.status(401).send('Unauthorized');
  const { title, rating, seen, notes } = req.body;
  try {
    await prisma.userMovieRating.upsert({
      where: { userId_title: { userId: req.user.id, title } },
      update: { rating, seen, notes },
      create: { userId: req.user.id, title, rating, seen, notes },
    });
    res.status(200).send('Updated');
  } catch (err) {
    res.status(500).send('Error updating: ' + err.message);
  }
});

module.exports = router;
