// moviesort.js

const fs = require('fs');
const TopMovies = require('../movies/TopMovies');

// Function to sort movies by title alphabetically
function sortMoviesByTitle() {
  const sortedMovies = TopMovies.slice().sort((a, b) => {
    const titleA = a.title.toLowerCase();
    const titleB = b.title.toLowerCase();
    if (titleA < titleB) return -1;
    if (titleA > titleB) return 1;
    return 0;
  });
  return sortedMovies;
}

// Function to write sorted movies to a new file
function writeSortedMoviesToFile(sortedMovies) {
  const fileName = '../movies/sortedTopMovies.js'; // Adjust the file path and name
  const fileContent = `module.exports = ${JSON.stringify(sortedMovies, null, 2)};\n`;

  fs.writeFile(fileName, fileContent, (err) => {
    if (err) throw err;
    console.log(`Sorted movies have been written to ${fileName}`);
  });
}

// Call the sorting function
const sortedMovies = sortMoviesByTitle();

// Call the function to write sorted movies to a new file
writeSortedMoviesToFile(sortedMovies);
