
const fs = require('fs');
const TopMovies = require('../movies/TopMovies');

function writeToFile(movie, genre){
  const fileName = `../movies/${genre}Movies.js`; 
  const fileContent = `export const ${genre}Movies = ${JSON.stringify(movie, null, 2)};\n`;
  if (!fs.existsSync(fileName)) {
    // Create the file if it doesn't exist
    fs.writeFileSync(fileName, fileContent, (err) => {
      if (err) throw err;
      console.log(`New file created: ${fileName}`);
    });
  } else {
    console.log(`File already exists: ${fileName}`);
  }
}


function sortMoviesByGenre() {
  TopMovies.forEach((movie) => {
    movie.genre.forEach((genre) => {
      writeToFile(movie, genre);
    });
  });
}

sortMoviesByGenre();
