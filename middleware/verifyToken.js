// middleware/verifyToken.js
import { verify } from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET;

export default function verifyToken(req, res, next) {
  const token = getTokenFromHeaders(req.headers);

  if (!token) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const decoded = verify(token, JWT_SECRET);
    req.user = decoded; // Attach user data to the request object
    next(); // Proceed to the next middleware or API route handler
  } catch (error) {
    console.error('Error verifying token:', error);
    return res.status(401).json({ error: 'Unauthorized' });
  }
}

function getTokenFromHeaders(headers) {
  const authHeader = headers.authorization;

  if (!authHeader) {
    return null; // No Authorization header
  }

  const tokenParts = authHeader.split(' ');

  if (tokenParts.length !== 2 || tokenParts[0] !== 'Bearer') {
    return null; // Invalid Authorization header format
  }

  return tokenParts[1]; // Return the token part
}
