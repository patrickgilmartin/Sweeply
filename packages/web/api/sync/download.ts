/**
 * Vercel Serverless Function: Download file metadata for sync
 * GET /api/sync/download
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
    const lastSync = req.query.lastSync as string;

    // TODO: Implement actual sync logic
    // - Verify JWT token and get user ID
    // - Get file metadata from cloud database since lastSync timestamp
    // - Return file metadata array

    // Placeholder response
    res.status(200).json({
      success: true,
      files: [],
      lastSync: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('Sync download error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}
