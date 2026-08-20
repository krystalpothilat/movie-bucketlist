const { verifyToken } = require('./jwt');
const prisma = require('./prisma');

async function attachUser(req, res, next) {
  const header = req.headers.authorization;

  if (!header?.startsWith('Bearer ')) {
    req.user = null;
    return next();
  }

  try {
    const token = header.split(' ')[1];
    const payload = verifyToken(token);

    req.user = await prisma.user.findUnique({
      where: { id: payload.id },
    });
  } catch {
    req.user = null;
  }

  next();
}

module.exports = attachUser;
