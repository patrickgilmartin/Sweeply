/**
 * Vercel Serverless Function: Register user
 * POST /api/auth/register
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';

// This is a placeholder implementation
// In production, you would:
// 1. Hash the password using bcrypt
// 2. Store user in Supabase/PlanetScale database
// 3. Generate JWT token
// 4. Return user and token

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

    if (password.length < 8) {
      return res.status(400).json({ message: 'Password must be at least 8 characters' });
    }

    // TODO: Implement actual registration logic
    // - Check if user exists
    // - Hash password with bcrypt
    // - Create user in database
    // - Generate JWT token
    // - Return user and token

    // Placeholder response
    const user = {
      id: `user_${Date.now()}`,
      email,
      createdAt: new Date().toISOString(),
    };

    const token = `token_${Date.now()}`; // In production, use JWT

    res.status(201).json({
      user,
      token,
    });
  } catch (error: any) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}
