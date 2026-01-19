# Media Cleanup Web Application

Web application for media cleanup with Sweeply UI.

## Features

- File System Access API integration (Chrome/Edge)
- IndexedDB for local data storage
- User authentication
- Cloud sync (metadata only)
- Sweeply card-based media review interface

## Development

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```

## Deployment

The application is configured for Vercel deployment. Ensure environment variables are set:

- `VITE_API_BASE_URL` - API base URL (defaults to `/api`)

## Browser Support

- **Chrome 86+**: Full File System Access API support
- **Edge 86+**: Full File System Access API support
- **Firefox/Safari**: Limited functionality (file upload fallback)

## API Routes

API routes are in the `api/` directory and will be deployed as Vercel serverless functions:

- `/api/auth/register` - User registration
- `/api/auth/login` - User login
- `/api/auth/logout` - User logout
- `/api/auth/me` - Get current user
- `/api/sync/upload` - Upload file metadata
- `/api/sync/download` - Download file metadata
