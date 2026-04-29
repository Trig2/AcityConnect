import jwt from 'jsonwebtoken';

export const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(403).json({ error: 'Invalid token' });
  }
};

function getAdminEmailList() {
  const configuredEmails = [process.env.ADMIN_EMAIL, process.env.ADMIN_EMAILS]
    .filter(Boolean)
    .flatMap((value) => value.split(','))
    .map((value) => value.trim().toLowerCase())
    .filter(Boolean);

  return new Set(configuredEmails);
}

export const isAdminMiddleware = (req, res, next) => {
  const adminEmails = getAdminEmailList();

  if (adminEmails.size === 0) {
    return res.status(403).json({ error: 'Admin access is not configured' });
  }

  if (!req.user?.email) {
    return res.status(403).json({ error: 'Admin access denied' });
  }

  if (!adminEmails.has(req.user.email.toLowerCase())) {
    return res.status(403).json({ error: 'Admin access denied' });
  }

  next();
};
