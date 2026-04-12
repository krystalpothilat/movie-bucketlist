const mongoose = require('mongoose');

const wheelSchema = new mongoose.Schema({
  name: String,
  movies: [
    {
      title: String,
      color: Number,
    },
  ],
});

module.exports = mongoose.model('Wheel', wheelSchema);
