require('dotenv').config();

const express = require('express');
const cors = require('cors');
const path = require('path');
const session = require('express-session');
const passport = require('./lib/passport');
const app = express();
const PORT = process.env.PORT || 5001;
const prisma = require('./lib/prisma');
const pgSession = require('connect-pg-simple')(session);

app.set('trust proxy', 1);

const movieRoutes = require('./routes/movie-endpoints');
const wheelRoutes = require('./routes/wheel-endpoints.js');
const authRoutes = require('./routes/auth-endpoints.js');
const listRoutes = require('./routes/list-endpoints');
const maintenanceRoutes = require('./routes/maintenance-endpoints');

app.use(
  cors({
    origin: process.env.CLIENT_URL || 'https://movie-bucketlist.vercel.app',
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type'],
    credentials: true,
    optionsSuccessStatus: 204,
  })
);

app.use(express.json());
app.use(express.static(path.join(__dirname, '../client/public')));

app.use(
  session({
    store: new pgSession({
      conString: process.env.DIRECT_URL, // direct connection, not the pooler
      tableName: 'session',
      createTableIfMissing: false, // table is now owned by Prisma migrations
    }),
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === 'production',
      httpOnly: true,
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      maxAge: 1000 * 60 * 60 * 24 * 7,
    },
  })
);

app.use(passport.initialize());
app.use(passport.session());

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
