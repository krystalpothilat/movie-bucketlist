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
  const { title, listId } = req.body;

  try {
    // Check user's role in the list
    const member = await prisma.listMember.findUnique({
      where: { listId_userId: { listId, userId: req.user.id } },
    });

    if (!member) return res.status(403).send('Not a member of this list');

    // Only admin can delete movies
    if (member.role !== 'admin') {
      return res.status(403).send('Only admins can delete movies');
    }

    await prisma.listMovie.deleteMany({
      where: { title, listId },
    });

    console.log(
      `User ${req.user.id} deleted movie "${title}" from list ${listId}`
    );
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error deleting movie');
  }
});

// UPDATE MOVIE DATA (ratings, notes, seen status)
// Requires 'editor' or 'admin' role
router.post('/update-user-data', async (req, res) => {
  if (!req.user) return res.status(401).send('Unauthorized');
  const { title, rating, seen, notes, listId } = req.body;

  try {
    // Check user's role in the list (if listId provided)
    if (listId) {
      const member = await prisma.listMember.findUnique({
        where: { listId_userId: { listId, userId: req.user.id } },
      });

      if (!member) return res.status(403).send('Not a member of this list');

      // Viewer role cannot edit
      if (member.role === 'viewer') {
        return res
          .status(403)
          .send('You do not have permission to edit movies');
      }
    }

    // Update user rating
    const result = await prisma.userMovieRating.upsert({
      where: { userId_title: { userId: req.user.id, title } },
      update: {
        rating: rating ?? undefined,
        seen: seen ?? undefined,
        notes: notes ?? undefined,
      },
      create: {
        userId: req.user.id,
        title,
        rating: rating ?? null,
        seen: seen ?? false,
        notes: notes ?? null,
      },
    });

    console.log(`User ${req.user.id} updated movie "${title}"`);
    res.json(result);
  } catch (err) {
    console.error('Error updating movie:', err.message);
    res.status(500).send('Server error updating movie');
  }
});

// ADD MOVIE
router.post('/add-movie', async (req, res) => {
  if (!req.user) return res.status(401).send('Unauthorized');
  const { title, poster, genre, year, listId, tmdbId } = req.body;

  if (!title?.trim() || !listId?.trim()) {
    return res.status(400).send('Title and listId required');
  }

  try {
    // Check user's role in the list
    const member = await prisma.listMember.findUnique({
      where: { listId_userId: { listId, userId: req.user.id } },
    });

    if (!member) return res.status(403).send('Not a member of this list');

    // Only admin can add movies
    if (member.role !== 'admin') {
      return res.status(403).send('Only admins can add movies');
    }

    const movie = await prisma.listMovie.create({
      data: {
        title: title.trim(),
        listId,
        poster: poster || null,
        genre: genre || [],
        year: year || null,
        tmdbId: tmdbId || null,
        addedById: req.user.id,
      },
    });

    console.log(
      `Movie "${title}" added to list ${listId} by user ${req.user.id}`
    );
    res.status(201).json(movie);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error adding movie');
  }
});

module.exports = router;
