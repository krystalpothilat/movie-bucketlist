const express = require('express');
const router = express.Router();
const prisma = require('../lib/prisma');

// GET ALL MOVIES
router.get('/get-movies', async (req, res) => {
  const { genres, sortBy, seenToggle, searchTitle } = req.query;
  const genresArray = genres ? genres.split(',') : [];

  try {
    let where = {};

    if (genresArray.length > 0) {
      where.genre = { hasSome: genresArray };
    }

    if (seenToggle === 'yes') where.seen = true;
    else if (seenToggle === 'no') where.seen = false;

    if (searchTitle && searchTitle.trim()) {
      where.title = { contains: searchTitle.trim(), mode: 'insensitive' };
    }

    let orderBy = [];
    if (searchTitle) {
      orderBy = [{ title: 'asc' }];
    } else if (sortBy === 'rank') {
      orderBy = [{ rank: 'asc' }, { title: 'asc' }];
    } else {
      orderBy = [{ title: 'asc' }];
    }

    let movies = await prisma.movie.findMany({ where, orderBy });

    if (sortBy === 'rank') {
      const ranked = movies.filter((m) => m.rank != null);
      const unranked = movies.filter((m) => m.rank == null).sort((a, b) => a.title.localeCompare(b.title));
      movies = [...ranked, ...unranked];
    }

    res.json(movies);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error fetching movies');
  }
});

// DELETE MOVIE
router.post('/delete-movie', async (req, res) => {
  const { title } = req.body;
  try {
    await prisma.movie.deleteMany({ where: { title } });
    res.status(200).send('Movie deleted successfully');
  } catch (err) {
    res.status(500).send('Error deleting movie');
  }
});

// TOGGLE SEEN
router.post('/update-seen', async (req, res) => {
  const { title } = req.body;
  try {
    const movie = await prisma.movie.findFirst({ where: { title } });
    if (!movie) return res.status(404).send('Movie not found');

    await prisma.movie.update({
      where: { id: movie.id },
      data: { seen: !movie.seen },
    });

    res.status(200).send('Movie updated successfully');
  } catch (err) {
    res.status(500).send('Error updating movie');
  }
});

// ADD MOVIE
router.post('/add-movie', async (req, res) => {
  try {
    const { title, genre, description, imdbId, imdbLink, rank, image, rating, year } = req.body;
    const movie = await prisma.movie.create({
      data: { title, genre, description, imdbId, imdbLink, rank, image, rating, year },
    });
    res.status(201).json(movie);
  } catch (err) {
    res.status(500).send('Error adding movie: ' + err.message);
  }
});

module.exports = router;