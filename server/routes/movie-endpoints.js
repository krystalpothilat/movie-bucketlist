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
      include: {
        movie: true,
        list: true,
      },
      orderBy: {
        addedAt: 'desc',
      },
    });

    const ratings = await prisma.userMovieRating.findMany({
      where: {
        userId: req.user.id,
      },
    });

    const ratingMap = new Map(ratings.map((r) => [r.movieId, r]));

    const movies = listMovies.map((listMovie) => {
      const movie = listMovie.movie;
      const rating = ratingMap.get(movie.id);

      return {
        id: listMovie.id,
        movieId: movie.id,
        listId: listMovie.listId,

        title: movie.title,
        image: movie.poster || null,
        poster: movie.poster || null,
        genre: movie.genre || [],
        year: movie.year || null,

        seen: rating?.seen ?? false,
        rating: rating?.rating ?? null,
        notes: rating?.notes ?? null,

        description: null,
        imdbLink: null,
        rank: null,

        addedAt: listMovie.addedAt,
        tmdbId: movie.tmdbId || null,
      };
    });

    res.json(movies);
  } catch (err) {
    console.error('Error fetching movies:', err);
    res.status(500).send('Server error fetching movies');
  }
});

// DELETE MOVIE
router.post('/delete-movie', async (req, res) => {
  if (!req.user) return res.status(401).send('Unauthorized');

  const { movieId, listId } = req.body;

  try {
    const member = await prisma.listMember.findUnique({
      where: {
        listId_userId: {
          listId,
          userId: req.user.id,
        },
      },
    });

    if (!member) {
      return res.status(403).send('Not a member of this list');
    }

    if (member.role !== 'admin') {
      return res.status(403).send('Only admins can delete movies');
    }

    await prisma.listMovie.delete({
      where: {
        listId_movieId: {
          listId,
          movieId,
        },
      },
    });

    console.log(
      `User ${req.user.id} deleted movie ${movieId} from list ${listId}`
    );

    res.json({ success: true });
  } catch (err) {
    console.error('Error deleting movie:', err);
    res.status(500).send('Server error deleting movie');
  }
});

// UPDATE USER MOVIE DATA
router.post('/update-user-data', async (req, res) => {
  if (!req.user) return res.status(401).send('Unauthorized');

  const { movieId, rating, seen, notes, listId } = req.body;

  if (!movieId) {
    return res.status(400).send('movieId required');
  }

  try {
    if (listId) {
      const member = await prisma.listMember.findUnique({
        where: {
          listId_userId: {
            listId,
            userId: req.user.id,
          },
        },
      });

      if (!member) {
        return res.status(403).send('Not a member of this list');
      }

      if (member.role === 'viewer') {
        return res
          .status(403)
          .send('You do not have permission to edit movies');
      }
    }

    const result = await prisma.userMovieRating.upsert({
      where: {
        userId_movieId: {
          userId: req.user.id,
          movieId,
        },
      },
      update: {
        ...(rating !== undefined && { rating }),
        ...(seen !== undefined && { seen }),
        ...(notes !== undefined && { notes }),
      },
      create: {
        userId: req.user.id,
        movieId,
        rating: rating ?? null,
        seen: seen ?? false,
        notes: notes ?? null,
      },
    });

    console.log(`User ${req.user.id} updated movie ${movieId}`);

    res.json(result);
  } catch (err) {
    console.error('Error updating movie:', err);
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
    const member = await prisma.listMember.findUnique({
      where: {
        listId_userId: {
          listId,
          userId: req.user.id,
        },
      },
    });

    if (!member) {
      return res.status(403).send('Not a member of this list');
    }

    if (member.role !== 'admin') {
      return res.status(403).send('Only admins can add movies');
    }

    // Find an existing canonical movie or create one
    let movie = await prisma.movie.findFirst({
      where: {
        title: {
          equals: title.trim(),
          mode: 'insensitive',
        },
      },
    });

    if (!movie) {
      movie = await prisma.movie.create({
        data: {
          title: title.trim(),
          poster: poster || null,
          genre: genre || [],
          year: year || null,
          tmdbId: tmdbId || null,
        },
      });
    } else if (tmdbId && !movie.tmdbId) {
      movie = await prisma.movie.update({
        where: { id: movie.id },
        data: {
          tmdbId,
          poster: poster || movie.poster,
          genre: genre || movie.genre,
          year: year || movie.year,
        },
      });
    }

    const listMovie = await prisma.listMovie.create({
      data: {
        listId,
        movieId: movie.id,
        addedById: req.user.id,
      },
      include: {
        movie: true,
      },
    });

    console.log(
      `Movie "${movie.title}" added to list ${listId} by user ${req.user.id}`
    );

    res.status(201).json({
      id: listMovie.id,
      movieId: movie.id,
      listId,
      title: movie.title,
      image: movie.poster,
      poster: movie.poster,
      genre: movie.genre,
      year: movie.year,
      tmdbId: movie.tmdbId,
      addedAt: listMovie.addedAt,
    });
  } catch (err) {
    console.error('Error adding movie:', err);
    res.status(500).send('Server error adding movie');
  }
});

module.exports = router;
