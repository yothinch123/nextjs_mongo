// pages/api/refresh.js
import { sign } from 'jsonwebtoken';
import clientPromise from '../../lib/mongodb';
import { setCookie } from 'nookies';

const JWT_SECRET = process.env.JWT_SECRET;

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).end(); // Method Not Allowed
  }

  const { refreshToken } = req.body;

  // Verify refresh token
  try {
    const client = await clientPromise;
    const usersCollection = client.db().collection('users');

    const user = await usersCollection.findOne({ refreshToken });

    if (!user) {
      return res.status(401).json({ error: 'Invalid refresh token' });
    }

    // Generate new JWT token
    const newJwtToken = sign({ userId: user._id }, JWT_SECRET, {
      expiresIn: '15m', // Token expires in 15 minutes
    });

    const newRefreshToken = sign({ userId: user._id }, JWT_SECRET, {
      expiresIn: '1d', // Token expires in 15 minutes
  });

    // Set new JWT token as HttpOnly cookie
    setCookie({ res }, 'token', newJwtToken, {
      maxAge: 900, // 15 minutes
      httpOnly: true,
      path: '/',
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
    });

    // Respond with success message or new JWT token
    res.status(200).json({ username: user.username, token: newJwtToken, refreshToken: newRefreshToken,  });
} catch (error) {
    console.error('Error refreshing token:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
