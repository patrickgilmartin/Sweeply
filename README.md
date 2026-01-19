# Sweeply - Media File Organizer

A modern application for cleaning up media files with an intuitive card-based interface. Available as both an **Electron desktop app** (Windows) and a **web application** (Chrome/Edge). Built with Electron, React, TypeScript, and modern web APIs.

## Features

- **Sweeply Interface**: Review one file at a time with large, centered preview
- **Multiple Media Types**: Supports images, documents, PDFs, videos, and audio files
- **Keep/Reject Actions**: 
  - Keep: Mark file as kept, leave it untouched
  - Reject: Move file to a "Deleted" folder (not permanently deleted)
- **Progress Tracking**: See how many files have been reviewed with persistent database
- **Keyboard Shortcuts**: 
  - Arrow Right / 'K': Keep file
  - Arrow Left / 'R': Reject file
- **Settings**: Configure scan paths, file types, and deleted folder location
- **Deleted File Manager**: View, restore, or permanently delete rejected files

## Requirements

- Windows 10 or later
- Node.js 18+ and npm

## Installation

1. Clone or download this repository
2. Install dependencies:
```bash
npm install
```

## Development

To run the application in development mode:

1. Build the shared package:
```bash
cd packages/shared
npm run build
```

2. Run the main process (in one terminal):
```bash
cd packages/main
npm run dev
```

3. Run the renderer process (in another terminal):
```bash
cd packages/renderer
npm run dev
```

4. In a third terminal, start Electron:
```bash
cd packages/main
npm start
```

## Building

To build the application for production:

```bash
npm run build
npm run package
```

This will create a Windows installer in the `dist` directory.

## Usage

1. **First Run**: On first launch, the app will prompt you to configure:
   - Scan paths (directories to scan for media files)
   - Deleted folder (where rejected files will be moved)

2. **Start Scan**: Click "Start Scan" to begin discovering media files

3. **Review Files**: 
   - Each file appears large and centered
   - Click "KEEP" or press Right Arrow/'K' to keep the file
   - Click "REJECT" or press Left Arrow/'R' to reject the file
   - Rejected files are moved to your deleted folder

4. **Progress**: Track your progress with the progress bar showing "X of Y reviewed"

5. **Manage Deleted Files**: 
   - Click the trash icon to view rejected files
   - Restore files back to their original location
   - Permanently delete files if needed

## Configuration

Settings can be accessed via the gear icon in the header. You can configure:

- **Scan Paths**: Add/remove directories to scan for media files
- **Deleted Folder**: Set the location for rejected files
- **File Types**: Select which file extensions to include (images, documents, videos, audio)

## Project Structure

```
Tinder_Clear/
├── packages/
│   ├── main/           # Electron main process (Node.js)
│   ├── renderer/       # Electron React frontend (Vite)
│   ├── web/            # Web application (React + File System Access API)
│   └── shared/         # Shared TypeScript types and constants
├── data/               # App data (created at runtime, Electron only)
│   ├── config.json     # User configuration
│   └── state.db        # SQLite database for progress tracking
└── package.json        # Root workspace configuration
```

## Web Application

The web version uses the File System Access API (Chrome/Edge) to access local files. It stores data in IndexedDB and works entirely in the browser.

### Running Web App Locally

```bash
cd packages/web
npm install
npm run dev
```

Then open `http://localhost:5173` in Chrome or Edge.

### Testing Web App

```bash
cd packages/web
npm run test              # Run tests
npm run test:coverage     # Run with coverage
npm run test:ui          # Run with UI
```

### Deploying Web App

See [DEPLOYMENT.md](./DEPLOYMENT.md) for deployment instructions (Vercel recommended).

## Technologies

### Desktop App (Electron)
- **Electron**: Desktop app framework
- **React**: UI framework
- **TypeScript**: Type safety
- **SQLite (better-sqlite3)**: Progress tracking database
- **fast-glob**: File scanning

### Web App
- **React**: UI framework
- **TypeScript**: Type safety
- **IndexedDB (Dexie.js)**: Client-side database
- **File System Access API**: Local file access
- **Vite**: Build tool

### Shared
- **react-pdf**: PDF preview
- **react-player**: Video/audio preview
- **mammoth**: DOCX to HTML conversion

## License

MIT
