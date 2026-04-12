const express = require('express');
const router = express.Router();

const Movie = require('../models/Movie');

// GET ALL MOVIES
router.get('/get-movies', async (req, res) => {
  const { genres, sortBy, seenToggle, searchTitle } = req.query;
  const genresArray = genres ? genres.split(',') : [];
  try {
    let query = {};
    if (genresArray.length > 0) {
      //query for db if looking for specific genre
      query.genre = { $in: genresArray };
    }

    if (seenToggle) {
      if (seenToggle === 'yes') {
        query.seen = true;
      } else if (seenToggle === 'no') {
        query.seen = false;
      }
    }

    //if searchTitle is provided, then query will be title and not genres
    if (searchTitle && searchTitle.trim()) {
      query.title = { $regex: new RegExp(searchTitle.trim(), 'i') };
    }

    let sortOrder = {};
    if (searchTitle) {
      sortOrder.title = 1;
    } else if (sortBy) {
      if (sortBy === 'rank') {
        sortOrder.rank = 1;
        sortOrder.title = 1;
      } else {
        sortOrder.title = 1;
      }
    }
    console.log('Constructed query:', JSON.stringify(query));

    const movies = await Movie.find(query).sort(sortOrder);

    let sortedMovies = movies;
    if (sortBy && sortBy === 'rank') {
      const rankedMovies = movies.filter((movie) => movie.rank != null);
      const unrankedMovies = movies.filter((movie) => movie.rank == null);
      sortedMovies = [...rankedMovies, ...unrankedMovies];
    }
    // res.send('Testing get-movies endpoint: working!');
    res.json(sortedMovies);
  } catch (err) {
    res.status(500).send('Server error fetching movies');
  }
});

// DELETE MOVIE FROM DB
router.post('/delete-movie', async (req, res) => {
  const { title } = req.body;
  try {
    const result = await Movie.deleteOne({ title: title });
    if (result.deletedCount === 1) {
      res.status(200).send('Movie deleted successfully');
    }
  } catch (err) {
    res.status(500).send('Error fetching movies');
  }
});

// UPDATE SEEN FIELD
router.post('/update-seen', async (req, res) => {
  const { title } = req.body;
  try {
    const movie = await Movie.findOne({ title: title });

    if (!movie) {
      return res.status(404).send('Movie not found');
    }

    const updatedSeen = !movie.seen;

    const result = await Movie.updateOne(
      { title: title },
      { $set: { seen: updatedSeen } }
    );

    res.status(200).send('Movie updated successfully');
  } catch (err) {
    res.status(500).send('Error updating moviee');
  }
});

// ADD MOVIE TO DB
router.post('/add-movie', async (req, res) => {
  try {
    const movieData = req.body;
    console.log(movieData);
    const movie = new Movie(movieData); // Create a new Movie instance
    await movie.save(); // Save to database
    res.status(201).send('Movie added successfully');
  } catch (error) {
    res.status(500).send('Error adding movie: ' + error.message);
  }
});

module.exports = router;
