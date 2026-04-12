const express = require('express');
const cors = require('cors');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 5001;
const mongoose = require('mongoose');
// require('dotenv').config({ path: path.resolve(__dirname, '.env') });
require('dotenv').config();

const movieRoutes = require('./routes/movie-endpoints');

app.use(cors({
    origin: process.env.CLIENT_URL || 'https://movie-bucketlist.vercel.app',
    methods: ['GET', 'POST', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type'],
    credentials: true,
    optionsSuccessStatus: 204,
}));

app.options('*', cors());

app.use(express.json());
app.use(express.static(path.join(__dirname, '../client/public')));

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something went wrong!');
});

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true, dbName: 'Movie-Bucketlist'});

const db = mongoose.connection;

db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', () => {
  console.log('Connected to MongoDB');
});

app.use('/api/movies', movieRoutes);

app.use("/", (req, res) => {
    res.send("Server is running");
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

