const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  const header = req.headers['authorization'];
  const token  = header && header.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Token i munguar' });
  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET || 'bookstore_secret');
    next();
  } catch {
    res.status(401).json({ error: 'Token i pavlefshëm' });
  }
};
