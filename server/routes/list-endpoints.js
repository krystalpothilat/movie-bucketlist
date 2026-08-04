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

// GET MOVIES IN A LIST
router.get('/:listId/movies', async (req, res) => {
  if (!req.user) return res.status(401).send('Unauthorized');
  const { listId } = req.params;

  try {
    // Check if user is owner or member of this list
    const list = await prisma.list.findFirst({
      where: {
        id: listId,
        OR: [
          { ownerId: req.user.id },
          { members: { some: { userId: req.user.id } } },
        ],
      },
    });

    if (!list) return res.status(403).send('Access denied');

    // Get all movies in this list
    const listMovies = await prisma.listMovie.findMany({
      where: { listId },
      orderBy: { addedAt: 'desc' },
    });

    // Get user ratings for these movies
    const userRatings = await prisma.userMovieRating.findMany({
      where: {
        userId: req.user.id,
        title: { in: listMovies.map((m) => m.title) },
      },
    });

    // Merge ListMovie with UserMovieRating
    const movies = listMovies.map((movie) => {
      const rating = userRatings.find((r) => r.title === movie.title);
      return {
        title: movie.title,
        image: movie.poster,
        description: '',
        genre: movie.genre,
        imdbLink: '',
        seen: rating?.seen ?? false,
        rating: rating?.rating ?? null,
        notes: rating?.notes ?? '',
        addedAt: movie.addedAt,
        tmdbId: movie.tmdbId,
      };
    });

    res.json(movies);
  } catch (err) {
    res.status(500).send('Error fetching list movies: ' + err.message);
  }
});

module.exports = router;
