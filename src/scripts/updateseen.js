const fs = require('fs');
const path = require('path');

const topMoviesFilePath = path.join(__dirname, '../movies/TopMovies.js');

// Read the file content
fs.readFile(topMoviesFilePath, 'utf8', (err, data) => {
    if (err) {
        console.error(`Error reading file: ${err}`);
        return;
    }

    // Extract the JSON part of the content
    const jsonStartIndex = data.indexOf('[');
    const jsonEndIndex = data.lastIndexOf(']') + 1;
    const jsonString = data.substring(jsonStartIndex, jsonEndIndex);

    try {
        // Parse the JSON content
        const topMovies = JSON.parse(jsonString);

        // Add the 'seen' attribute to each movie
        const updatedMovies = topMovies.map(movie => {
            // Add 'seen' attribute to every object within each movie object
            for (const key in movie) {
                if (typeof movie[key] === 'object' && !Array.isArray(movie[key])) {
                    movie[key]['seen'] = 'No';
                }
            }
            movie['seen'] = 'No'; // Also add 'seen' attribute to the movie object itself
            return movie;
        });

        // Convert the updated movies back to JSON string
        const updatedMoviesJson = JSON.stringify(updatedMovies, null, 2);

        // Write the updated content back to the file
        const updatedFileContent = `export const TopMovies = ${updatedMoviesJson};`;

        fs.writeFile(topMoviesFilePath, updatedFileContent, (err) => {
            if (err) {
                console.error(`Error writing file: ${err}`);
                return;
            }
            console.log(`Updated movies have been written to ${topMoviesFilePath}`);
        });
    } catch (error) {
        console.error(`Error parsing JSON: ${error}`);
    }
});
