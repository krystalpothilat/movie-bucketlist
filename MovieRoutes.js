const Movie = require('./src/models/Movie.js');

const getMovies = async (genres, sortBy) => {
    try{
        let query = {}
        if(genres && genres.length > 0){ //query for db if looking for specific genre
            query.genres = {$in: genres };
        }

        let sortOrder = {};
        if(sortBy){
            if(sortBy==='rank'){
                sortOrder.rank = 1 //by rank
            } else {
                sortOrder.title = 1; //alphabetical
            }
        }

        const movies = await Movie.find(query).sort(sortOrder);
        return movies;
    } catch (err){
        console.error(err);
    }
};

module.exports = { getMovies };