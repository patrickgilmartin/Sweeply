/**
 * Vercel Serverless Function: Upload file metadata for sync
 * POST /api/sync/upload
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
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const token = authHeader.substring(7);
    const { files } = req.body;

    if (!files || !Array.isArray(files)) {
      return res.status(400).json({ message: 'Files array is required' });
    }

    // TODO: Implement actual sync logic
    // - Verify JWT token and get user ID
    // - Store file metadata in cloud database (Supabase/PlanetScale)
    // - Handle conflicts (last-write-wins or manual resolution)
    // - Return sync status

    // Placeholder response
    res.status(200).json({
      success: true,
      synced: files.length,
      message: 'Files synced successfully',
    });
  } catch (error: any) {
    console.error('Sync upload error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}
