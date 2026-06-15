const express = require('express');
const cors = require('cors');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 5001;
const prisma = require('./lib/prisma');

require('dotenv').config();

const movieRoutes = require('./routes/movie-endpoints');
const wheelRoutes = require('./routes/wheel-endpoints.js');
const loginRoutes = require('./routes/login-endpoints.js');

app.use(
  cors({
    origin: process.env.CLIENT_URL || 'https://movie-bucketlist.vercel.app',
    methods: ['GET', 'POST', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type'],
    credentials: true,
    optionsSuccessStatus: 204,
  })
);

app.options('*', cors());

app.use(express.json());
app.use(express.static(path.join(__dirname, '../client/public')));

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something went wrong!');
});


prisma.$connect()
  .then(() => console.log('Connected to Postgres via Prisma'))
  .catch((err) => console.error('Prisma connection error:', err));

app.use('/api/movies', movieRoutes);
app.use('/api/wheels', wheelRoutes);
app.use('/api/login', loginRoutes);

app.use('/', (req, res) => {
  res.send('Server is running');
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
