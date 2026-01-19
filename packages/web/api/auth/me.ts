/**
 * Vercel Serverless Function: Get current user
 * GET /api/auth/me
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const token = authHeader.substring(7);

    // TODO: Implement actual authentication logic
    // - Verify JWT token
    // - Get user from database
    // - Return user data

    // Placeholder response
    const user = {
      id: 'user_123',
      email: 'user@example.com',
      createdAt: new Date().toISOString(),
    };

    res.status(200).json(user);
  } catch (error: any) {
    console.error('Get user error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}
