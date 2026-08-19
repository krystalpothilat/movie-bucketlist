const express = require('express');
const router = express.Router();
const prisma = require('../lib/prisma');
const { rateLimit, ipKeyGenerator } = require('express-rate-limit');
const { hashJoinCode, generateJoinCode } = require('../lib/joinCode');

// Limits brute-force guessing of join codes: 10 attempts per user per 15 min
const joinCodeLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  keyGenerator: (req) => req.user?.id || ipKeyGenerator(req.ip),
  standardHeaders: true,
  legacyHeaders: false,
  message: 'Too many join attempts. Please try again later.',
});

// GET ALL LISTS FOR USER
router.get('/get-lists', async (req, res) => {
  if (!req.user) return res.status(401).send('Unauthorized');
  try {
    const lists = await prisma.list.findMany({
      where: {
        OR: [
          { ownerId: req.user.id },
          { members: { some: { userId: req.user.id } } },
        ],
      },
      include: {
        _count: { select: { movies: true, members: true } },
      },
      orderBy: { createdAt: 'asc' },
    });
    res.json(lists);
  } catch (err) {
    res.status(500).send('Error fetching lists: ' + err.message);
  }
});

// CREATE LIST
router.post('/create', async (req, res) => {
  if (!req.user) return res.status(401).send('Unauthorized');
  const { name } = req.body;
  if (!name?.trim()) return res.status(400).send('Name required');
  try {
    const list = await prisma.list.create({
      data: {
        name: name.trim(),
        ownerId: req.user.id,
        // Add creator as admin member
        members: {
          create: {
            userId: req.user.id,
            role: 'admin',
          },
        },
      },
      include: {
        _count: { select: { movies: true } },
      },
    });
    res.status(201).json(list);
  } catch (err) {
    res.status(500).send('Error creating list: ' + err.message);
  }
});

// GET MOVIES IN A LIST
router.get('/:listId/movies', async (req, res) => {
  if (!req.user) return res.status(401).send('Unauthorized');

  const { listId } = req.params;

  try {
    const [list, listMovies, userRatings] = await Promise.all([
      prisma.list.findFirst({
        where: {
          id: listId,
          OR: [
            { ownerId: req.user.id },
            { members: { some: { userId: req.user.id } } },
          ],
        },
      }),

      prisma.listMovie.findMany({
        where: { listId },
        include: {
          movie: true,
        },
        orderBy: {
          addedAt: 'desc',
        },
      }),

      prisma.userMovieRating.findMany({
        where: {
          userId: req.user.id,
        },
      }),
    ]);

    if (!list) {
      console.error(
        `Access denied: user ${req.user.id} not member of list ${listId}`
      );

      return res.status(403).send('Access denied');
    }

    const ratingMap = new Map(
      userRatings.map((rating) => [rating.movieId, rating])
    );

    const movies = listMovies.map((listMovie) => {
      const movie = listMovie.movie;
      const rating = ratingMap.get(movie.id);

      return {
        id: listMovie.id,
        movieId: movie.id,
        listId: listMovie.listId,

        title: movie.title || '',
        image: movie.poster || null,
        poster: movie.poster || null,
        description: '',
        genre: movie.genre || [],
        imdbLink: '',
        seen: rating?.seen ?? false,
        rating: rating?.rating ?? null,
        notes: rating?.notes ?? '',
        year: movie.year || null,
        addedAt: listMovie.addedAt,
        tmdbId: movie.tmdbId || null,
      };
    });

    console.log(
      `Retrieved ${movies.length} movies from list ${listId} for user ${req.user.id}`
    );

    res.json(movies);
  } catch (err) {
    console.error('Error fetching list movies:', err);

    res.status(500).send('Error fetching list movies: ' + err.message);
  }
});

// UPDATE LIST NAME
router.patch('/:listId', async (req, res) => {
  if (!req.user) return res.status(401).send('Unauthorized');
  const { listId } = req.params;
  const { name } = req.body;

  if (!name?.trim()) return res.status(400).send('Name required');

  try {
    // Check if user is owner (only owner can edit)
    const list = await prisma.list.findFirst({
      where: { id: listId, ownerId: req.user.id },
    });

    if (!list) {
      console.error(
        `Update failed: user ${req.user.id} not owner of list ${listId}`
      );
      return res.status(403).send('Only owner can edit list name');
    }

    const updated = await prisma.list.update({
      where: { id: listId },
      data: { name: name.trim() },
      include: {
        _count: { select: { movies: true, members: true } },
      },
    });

    console.log(`List ${listId} updated by owner ${req.user.id}`);
    res.json(updated);
  } catch (err) {
    console.error('Error updating list:', err.message);
    res.status(500).send('Error updating list: ' + err.message);
  }
});

// DELETE LIST
router.delete('/:listId', async (req, res) => {
  if (!req.user) return res.status(401).send('Unauthorized');
  const { listId } = req.params;

  try {
    // Check if user is owner or member of this list
    const list = await prisma.list.findFirst({
      where: { id: listId },
      include: { members: true },
    });

    if (!list) {
      console.error(`Delete failed: list ${listId} not found`);
      return res.status(404).send('List not found');
    }

    const isMember = list.members.some((m) => m.userId === req.user.id);
    if (!isMember && list.ownerId !== req.user.id) {
      console.error(
        `Delete failed: user ${req.user.id} not member of list ${listId}`
      );
      return res.status(403).send('Only members can delete');
    }

    // If user is owner, delete the entire list
    if (list.ownerId === req.user.id) {
      await prisma.list.delete({
        where: { id: listId },
      });
      console.log(`List ${listId} deleted by owner ${req.user.id}`);
      return res.json({ success: true, action: 'list_deleted' });
    }

    // Otherwise, just remove user from list members
    await prisma.listMember.delete({
      where: {
        listId_userId: { listId, userId: req.user.id },
      },
    });
    console.log(`User ${req.user.id} removed from list ${listId}`);
    res.json({ success: true, action: 'user_removed' });
  } catch (err) {
    console.error('Error deleting list:', err.message);
    res.status(500).send('Error deleting list: ' + err.message);
  }
});

module.exports = router;

// GENERATE JOIN CODE
router.post('/:listId/generate-code', async (req, res) => {
  if (!req.user) return res.status(401).send('Unauthorized');
  const { listId } = req.params;

  try {
    // Check if user is owner
    const list = await prisma.list.findFirst({
      where: { id: listId, ownerId: req.user.id },
    });

    if (!list) return res.status(403).send('Only owner can share');

    // Generate 6-char alphanumeric code, hash before storing
    const joinCode = generateJoinCode();
    const joinCodeHash = hashJoinCode(joinCode);

    await prisma.list.update({
      where: { id: listId },
      data: { joinCodeHash, isShared: true },
    });

    console.log(`Share code generated for list ${listId}`);
    // Return the plaintext code once — it's not recoverable after this
    res.json({ joinCode });
  } catch (err) {
    console.error('Error generating code:', err.message);
    res.status(500).send('Error generating code: ' + err.message);
  }
});

// JOIN LIST BY CODE
router.post('/join-by-code', joinCodeLimiter, async (req, res) => {
  if (!req.user) return res.status(401).send('Unauthorized');
  const { joinCode } = req.body;

  if (!joinCode?.trim()) return res.status(400).send('Code required');

  try {
    // Deterministic hash -> direct lookup on the unique index, O(1)
    const joinCodeHash = hashJoinCode(joinCode);
    const list = await prisma.list.findUnique({
      where: { joinCodeHash },
    });

    if (!list || !list.isShared) return res.status(404).send('Code not found');

    // Check if already member
    const existing = await prisma.listMember.findUnique({
      where: { listId_userId: { listId: list.id, userId: req.user.id } },
    });

    if (existing) return res.status(400).send('Already a member');

    // Add user as member with viewer role (read-only by default)
    await prisma.listMember.create({
      data: {
        listId: list.id,
        userId: req.user.id,
        role: 'viewer', // default role
      },
    });

    console.log(
      `User ${req.user.id} joined list ${list.id} via code with role: viewer`
    );
    res.json({
      success: true,
      listId: list.id,
      listName: list.name,
      role: 'viewer',
    });
  } catch (err) {
    console.error('Error joining list:', err.message);
    res.status(500).send('Error joining list: ' + err.message);
  }
});

// GET LIST MEMBERS
router.get('/:listId/members', async (req, res) => {
  if (!req.user) return res.status(401).send('Unauthorized');
  const { listId } = req.params;

  try {
    // Check if user has access
    const list = await prisma.list.findFirst({
      where: {
        id: listId,
        OR: [
          { ownerId: req.user.id },
          { members: { some: { userId: req.user.id } } },
        ],
      },
    });

    if (!list) return res.status(403).send('Access denied');

    const members = await prisma.listMember.findMany({
      where: { listId },
      include: { user: { select: { name: true, email: true } } },
      orderBy: { joinedAt: 'asc' },
    });

    res.json(members);
  } catch (err) {
    console.error('Error fetching members:', err.message);
    res.status(500).send('Error fetching members: ' + err.message);
  }
});

// UPDATE MEMBER ROLE (admin only)
router.patch('/:listId/members/:memberId/role', async (req, res) => {
  if (!req.user) return res.status(401).send('Unauthorized');
  const { listId, memberId } = req.params;
  const { role } = req.body;

  const validRoles = ['admin', 'editor', 'viewer'];
  if (!validRoles.includes(role)) {
    return res.status(400).send('Invalid role');
  }

  try {
    // Check if requester is admin of list
    const list = await prisma.list.findFirst({
      where: { id: listId, ownerId: req.user.id },
    });

    if (!list) return res.status(403).send('Only owner can manage permissions');

    const updated = await prisma.listMember.update({
      where: { id: memberId },
      data: { role },
      include: { user: { select: { name: true, email: true } } },
    });

    console.log(`Member ${memberId} in list ${listId} role updated to ${role}`);
    res.json(updated);
  } catch (err) {
    console.error('Error updating member role:', err.message);
    res.status(500).send('Error updating member role: ' + err.message);
  }
});

// REMOVE MEMBER FROM LIST (admin only)
router.delete('/:listId/members/:memberId', async (req, res) => {
  if (!req.user) return res.status(401).send('Unauthorized');
  const { listId, memberId } = req.params;

  try {
    // Check if requester is admin of list
    const list = await prisma.list.findFirst({
      where: { id: listId, ownerId: req.user.id },
    });

    if (!list) return res.status(403).send('Only owner can remove members');

    await prisma.listMember.delete({
      where: { id: memberId },
    });

    console.log(`Member ${memberId} removed from list ${listId}`);
    res.json({ success: true });
  } catch (err) {
    console.error('Error removing member:', err.message);
    res.status(500).send('Error removing member: ' + err.message);
  }
});
