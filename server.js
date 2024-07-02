const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const app = express();
const port = 5001;

app.use(cors());
app.use(express.json());

const mainFilePath = path.join(__dirname, 'src', 'movies', 'TopMovies.json');

app.post('/delete-movie', (req, res) => {
    console.log("reached");
    const { title } = req.body;
    let genres = [];

    console.log(title);
    fs.readFile(mainFilePath, 'utf8', (err, data) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Error reading file');
        }

        let movies = JSON.parse(data);
        const movieToDelete = movies.find(movie => movie.title === title);
        if (!movieToDelete) {
            return res.status(404).send('Movie not found');
        }
        genres = movieToDelete.genre;
        movies = movies.filter(movie => movie.title !== title);
        const updatedData = JSON.stringify(movies, null, 2);

        fs.writeFile(mainFilePath, updatedData, 'utf8', err => {
            if (err) {
                console.error(err);
                return res.status(500).send('Error writing file');
            }

            // Delete from genre-specific files
            let deleteCount = 0;
            const totalGenres = genres.length;

            genres.forEach(genre => {
                const genreFilePath = path.join(__dirname, 'src', 'movies', `${genre}Movies.json`);
                fs.readFile(genreFilePath, 'utf-8', (err, data) => {
                    if (err) {
                        console.error(err);
                        return res.status(500).send('Error reading file');
                    }
            
                    let genreMovies = JSON.parse(data);
                    genreMovies = genreMovies.filter(movie => movie.title !== title);
                    const updatedGenreData = JSON.stringify(genreMovies, null, 2);
            
                    fs.writeFile(genreFilePath, updatedGenreData, 'utf8', err => {
                        if (err) {
                            console.error(err);
                            return res.status(500).send('Error writing file');
                        }

                        deleteCount++;
                        if (deleteCount === totalGenres) {
                            res.send('Movie deleted successfully');
                        }
                    });
                });
            });
        });
    });
});

app.post('/getMoviesByGenres', (req, res) => {
    const { genres } = req.body;
    console.log(genres);
    const movieIds= new Set();
    let allMovies=[];

    genres.forEach((genre) => {
        const genreFileName= path.join(__dirname, 'src', 'movies', `${genre}Movies.json`);

        try {
            const genreData = fs.readFileSync(path.resolve(__dirname, genreFileName), 'utf8');
            const moviesInGenre = JSON.parse(genreData);
            moviesInGenre.forEach((movie) => {
                if (!movieIds.has(movie.id)) {
                    movieIds.add(movie.id);
                    allMovies.push(movie);
                }
            });
            const fileName = path.resolve(__dirname,'./src/movies/CurrentMovies.json');
            const fileContent = JSON.stringify(allMovies, null, 2);

            fs.writeFileSync(fileName, fileContent, (err) => {
                if (err) throw err;
                console.log(`Movies have been written to ${fileName}`);
            });
          } catch (err) {
            console.error(`Error reading or parsing ${genre} movies:`, err);
          }

          res.json(allMovies);
    });

    

});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
