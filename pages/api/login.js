// pages/api/login.js
import { compare } from 'bcryptjs';
import { sign, verify } from 'jsonwebtoken';
import { setCookie } from 'nookies';
import { v4 as uuidv4 } from 'uuid'; // Example library for generating UUIDs
import clientPromise from '../../lib/mongodb';

const JWT_SECRET = process.env.JWT_SECRET;

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).end(); // Method Not Allowed
  }

  const { username, password } = req.body;

  // Example: Replace with your own logic to fetch user data from a database
  const client = await clientPromise;
  const usersCollection = client.db().collection('users');

  try {
    const user = await usersCollection.findOne({ username });

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const passwordMatch = await compare(password, user.password);

    if (password !== user.password) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate JWT token
    const jwtToken = sign({ userId: user._id }, JWT_SECRET, {
        expiresIn: '15m', // Token expires in 15 minutes
    });

    const refreshToken = sign({ userId: user._id }, JWT_SECRET, {
        expiresIn: '1d', // Token expires in 15 minutes
    });
    
    // Generate Refresh token
    await usersCollection.updateOne(
      { _id: user._id },
      { $set: { refreshToken } }
    ); // Store refresh token in the database

    // Set JWT token as HttpOnly cookie
    setCookie({ res }, 'token', jwtToken, {
      maxAge: 900, // 15 minutes
      httpOnly: true,
      path: '/',
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
    });

    // Respond with user data or success message
    res.status(200).json({ username: user.username, token: jwtToken, refreshToken,  });
  } catch (error) {
    console.error('Error logging in:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
