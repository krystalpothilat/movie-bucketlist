const fs = require('fs').promises; 
const path = require('path');

const fileName = '../movies/TopMovies.json'; 

async function processMovies(movies) {
  for (const movie of movies) {
    for (const genre of movie.genre) {
      const genreFileName = `../movies/${genre}Movies.json`; 
      try {
        let genreMovies;
        try {
          const genreData = await fs.readFile(genreFileName, 'utf8');
          genreMovies = JSON.parse(genreData);
        } catch (err) {
          if (err.code === 'ENOENT') {
            genreMovies = [];
          } else {
            throw err;
          }
        }

        genreMovies.push(movie);

        await fs.writeFile(genreFileName, JSON.stringify(genreMovies, null, 2));
        console.log(`Movie has been added to ${genreFileName}`);
      } catch (err) {
        console.error(`Error processing movie ${movie.title} for genre ${genre}:`, err);
      }
    }
  }
}

fs.readFile(fileName, 'utf8')
  .then((data) => {
    try {
      const movies = JSON.parse(data);
      if (!Array.isArray(movies)) {
        throw new Error('Parsed data is not an array');
      }

      // Process each movie and its genres
      return processMovies(movies);
    } catch (err) {
      console.error('Error parsing JSON:', err);
    }
  })
  .catch((err) => {
    console.error('Error reading file:', err);
  });
