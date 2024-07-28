const mongoose = require('mongoose');

const movieSchema = new mongoose.Schema({
  title: String,
  genre: [String],
  id: String,
  imdbid: String,
  rank: Number,
  image: String,
  big_image: String,
  rating: String,
  thumbnail: String,
  seen: Boolean,
});

module.exports = mongoose.model('Movie', movieSchema);
