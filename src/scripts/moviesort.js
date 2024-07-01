const fs = require('fs');

function sortMoviesByTitle(movies) {
  const sortedMovies = movies.slice().sort((a, b) => {
    const titleA = a.title.toLowerCase();
    const titleB = b.title.toLowerCase();
    if (titleA < titleB) return -1;
    if (titleA > titleB) return 1;
    return 0;
  });
  return sortedMovies;
}

function writeSortedMovies(sortedMovies) {
  const fileName = '../movies/sortedTopMovies.json'; // Adjust the file path and name
  const fileContent = JSON.stringify(sortedMovies, null, 2);

  fs.writeFile(fileName, fileContent, (err) => {
    if (err) {
      console.error('Error writing file:', err);
    } else {
      console.log(`Sorted movies have been written to ${fileName}`);
    }
  });
}

const fileName = '../movies/TopMovies.json'; // Adjust the file path and name
fs.readFile(fileName, 'utf8', (err, data) => {
  if (err) {
    console.error('Error reading file:', err);
    return;
  }
  try {
    const movies = JSON.parse(data);

    // Call the sorting function
    const sortedMovies = sortMoviesByTitle(movies);

    // Call the function to write sorted movies to a new file
    writeSortedMovies(sortedMovies);
  } catch (err) {
    console.error('Error parsing JSON:', err);
  }
});
