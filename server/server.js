require('dotenv').config();

const express = require('express');
const cors = require('cors');
const path = require('path');
const passport = require('./lib/passport');
const attachUser = require('./lib/authMiddleware');

const app = express();
const PORT = process.env.PORT || 5001;
const prisma = require('./lib/prisma');

const movieRoutes = require('./routes/movie-endpoints');
const wheelRoutes = require('./routes/wheel-endpoints.js');
const authRoutes = require('./routes/auth-endpoints.js');
const listRoutes = require('./routes/list-endpoints');
const maintenanceRoutes = require('./routes/maintenance-endpoints');

app.set('trust proxy', 1);

app.use(
  cors({
    origin: process.env.CLIENT_URL || 'https://movie-bucketlist.vercel.app',
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    optionsSuccessStatus: 204,
  })
);

app.use(express.json());
app.use(express.static(path.join(__dirname, '../client/public')));

app.use(passport.initialize());
app.use(attachUser);

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something went wrong!');
});

prisma
  .$connect()
  .then(() => console.log('Connected to Postgres via Prisma'))
  .catch((err) => console.error('Prisma connection error:', err));

app.use('/api/movies', movieRoutes);
app.use('/api/wheels', wheelRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/lists', listRoutes);
app.use('/maintenance', maintenanceRoutes);

app.use('/', (req, res) => {
  res.send('Server is running');
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
