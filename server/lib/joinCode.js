const crypto = require('crypto');

// Deterministic hash so we can look codes up directly by the hash (O(1) via
// the unique index on joinCodeHash), instead of bcrypt-comparing against
// every shared list. Security still holds: without JOIN_CODE_SECRET, a
// leaked joinCodeHash can't be reversed or brute-forced offline.
function hashJoinCode(code) {
  const secret = process.env.JOIN_CODE_SECRET;
  if (!secret) {
    throw new Error('JOIN_CODE_SECRET is not set');
  }
  return crypto
    .createHmac('sha256', secret)
    .update(code.trim().toUpperCase())
    .digest('hex');
}

function generateJoinCode() {
  // 8 chars from base36 (0-9, A-Z) -> ~2.8 trillion possibilities
  let code = '';
  while (code.length < 8) {
    code += Math.random().toString(36).substring(2).toUpperCase();
  }
  return code.substring(0, 8);
}

module.exports = { hashJoinCode, generateJoinCode };
