const mongoose = require('mongoose');

const movieSchema = new mongoose.Schema({
  title: String,
  genre: [String],
  description: String,
  id: String,
  imdbid: String,
  imdb_link: String,
  rank: Number,
  image: String,
  rating: String,
  year: String,
  seen: Boolean,

});

module.exports = mongoose.model('Movie', movieSchema);
