const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const app = express();
const port = 5001;
const mongoose = require('mongoose');
require('dotenv').config();
const {getMovies} = require('./MovieRoutes.js');
const Movie = require('./src/models/Movie.js');

app.use(cors());
app.use(express.json());

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true, dbName: 'Movie-Bucketlist'});

const db = mongoose.connection;

db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', () => {
  console.log('Connected to MongoDB');
});


app.post('/get-movies', async (req, res) => {
    const { genres, sortBy, searchTitle } = req.body;
    console.log('genres are :', genres);
    console.log('search title is :', searchTitle);
    try{
        let query = {}
        if(genres && genres.length > 0){ //query for db if looking for specific genre
            query.genre = { $in: genres };
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
        if (sortBy === 'rank') {
            const rankedMovies = movies.filter(movie => movie.rank != null);
            const unrankedMovies = movies.filter(movie => movie.rank == null);
            sortedMovies = [...rankedMovies, ...unrankedMovies];
        }

        res.json(sortedMovies);
    } catch (err) {
        res.status(500).send('Error fetching movies');
      }

});

app.post('/delete-movie', async (req, res) => {
    const { title } = req.body;
    try{

        const result = await Movie.deleteOne({title: title});
        if (result.deletedCount === 1) {
            res.status(200).send('Movie deleted successfully');
        } 
    } catch (err) {
        res.status(500).send('Error fetching movies');
      }

});

app.post('/update-seen', async (req, res) => {
    const { title } = req.body;
    try{

        const movie = await Movie.findOne({ title: title });

        if (!movie) {
            return res.status(404).send('Movie not found');
        }

        const updatedSeen = !movie.seen;

        const result = await Movie.updateOne({ title: title }, { $set: { seen: updatedSeen } });

        if (result.modifedCount === 1) {
            res.status(200).send('Movie updated successfully');
        } else {
            res.status(304).send('No changes made');
        }
    } catch (err) {
        res.status(500).send('Error updating moviee');
      }

});

app.post('/add-movie', async (req, res) => {
    try {
        const movieData = req.body;
        const movie = new Movie(movieData); // Create a new Movie instance
        await movie.save(); // Save to database
        res.status(201).send('Movie added successfully');
    } catch (error) {
        res.status(500).send('Error adding movie: ' + error.message);
    }

});




app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
