/**
 * Vercel Serverless Function: Logout user
 * POST /api/auth/logout
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
    // TODO: Implement actual logout logic
    // - Invalidate JWT token (if using token blacklist)
    // - Clear session data

    res.status(200).json({ message: 'Logged out successfully' });
  } catch (error: any) {
    console.error('Logout error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}
