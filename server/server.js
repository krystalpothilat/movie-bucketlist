const express = require('express');
const cors = require('cors');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 5001;
const mongoose = require('mongoose');
// require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
require('dotenv').config();

const Movie = require('./models/Movie.js');

app.use(cors({
    origin: 'https://movie-bucketlist.vercel.app',
    methods: ['GET', 'POST', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type'],
    credentials: true,
    optionsSuccessStatus: 204,
}));

app.options('*', cors());

app.use(express.json());
app.use(express.static(path.join(__dirname, '../client/public')));

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something went wrong!');
});
// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true, dbName: 'Movie-Bucketlist'});

const db = mongoose.connection;

db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', () => {
  console.log('Connected to MongoDB');
});


app.get('/test', (req, res) => {
    res.send('Test endpoint working!');
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
        console.log('Movies found:', movies.length);

        let sortedMovies = movies;
        if (sortBy && sortBy === 'rank') {
            const rankedMovies = movies.filter(movie => movie.rank != null);
            const unrankedMovies = movies.filter(movie => movie.rank == null);
            sortedMovies = [...rankedMovies, ...unrankedMovies];
        }
        console.log("sorting");
        res.json(sortedMovies);
    } catch (err) {
        res.status(500).send('Server error fetching movies');
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

        res.status(200).send('Movie updated successfully');
    } catch (err) {
        res.status(500).send('Error updating moviee');
      }

});

app.post('/add-movie', async (req, res) => {
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

app.use("/", (req, res) => {
    res.send("Server is running");
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

