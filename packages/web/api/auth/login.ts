/**
 * Vercel Serverless Function: Login user
 * POST /api/auth/login
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    // TODO: Implement actual login logic
    // - Find user by email in database
    // - Verify password with bcrypt
    // - Generate JWT token
    // - Return user and token

    // Placeholder response
    const user = {
      id: `user_${Date.now()}`,
      email,
      createdAt: new Date().toISOString(),
    };

    const token = `token_${Date.now()}`; // In production, use JWT

    res.status(200).json({
      user,
      token,
    });
  } catch (error: any) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}
