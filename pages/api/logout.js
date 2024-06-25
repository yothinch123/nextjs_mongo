// pages/api/logout.js
import { destroyCookie } from 'nookies'; // Example library for deleting cookies

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).end(); // Method Not Allowed
  }

  // Remove token cookie
  destroyCookie({ res }, 'token', {
    path: '/',
  });

  // Respond with success message
  res.status(200).json({ message: 'Logout successful' });
}
