# Test Scenarios

This document outlines all test scenarios for the Media Cleanup web application.

## Test Data Structure

The `test_data/` folder contains test files organized by type:
- `images/` - Test image files
- `documents/` - Test document files (TXT, PDF, DOCX)
- `videos/` - Test video files
- `audio/` - Test audio files
- `subfolder/` - Nested folder for recursive scanning tests
- `.hidden_folder/` - Hidden folder for exclusion tests

## Test Scenarios

### 1. Database Operations

#### 1.1 File Storage
- ✅ Add single file to database
- ✅ Add multiple files to database
- ✅ Prevent duplicate files
- ✅ Retrieve file by path
- ✅ Update file status
- ✅ Get pending files
- ✅ Get statistics

#### 1.2 Queue Management
- ✅ Save queue state
- ✅ Retrieve queue state
- ✅ Update queue state

#### 1.3 Rejected Files
- ✅ Add rejected file record
- ✅ Get rejected files list
- ✅ Remove rejected file record

### 2. File Scanner

#### 2.1 Extension Detection
- ✅ Recognize image extensions (.jpg, .png, .gif)
- ✅ Recognize document extensions (.pdf, .txt, .docx)
- ✅ Recognize video extensions (.mp4, .avi)
- ✅ Recognize audio extensions (.mp3, .wav)
- ✅ Handle invalid extensions
- ✅ Handle case insensitivity

#### 2.2 File Filtering
- ✅ Filter by extension
- ✅ Filter by size (min/max)
- ✅ Exclude hidden files
- ✅ Exclude system files
- ✅ Filter already-reviewed files

### 3. File Operations

#### 3.1 Keep File
- ✅ Mark file as kept in database
- ✅ Update reviewed_at timestamp
- ✅ Update statistics

#### 3.2 Reject File
- ✅ Move file to deleted folder
- ✅ Handle filename collisions
- ✅ Record in rejected_files table
- ✅ Update file status

#### 3.3 Export Rejected Files
- ✅ Export rejected files list
- ✅ Generate downloadable file

### 4. Error Handling

#### 4.1 Database Errors
- ✅ Handle missing files
- ✅ Handle invalid paths
- ✅ Handle database connection errors

#### 4.2 File System Errors
- ✅ Handle permission denied
- ✅ Handle file not found
- ✅ Handle disk space errors
- ✅ Handle file in use errors

#### 4.3 Edge Cases
- ✅ Very long file paths
- ✅ Special characters in paths
- ✅ Unicode characters in paths
- ✅ Empty files
- ✅ Very large files

### 5. Authentication

#### 5.1 User Registration
- ✅ Register new user
- ✅ Validate email format
- ✅ Validate password length
- ✅ Handle duplicate emails
- ✅ Store user in database

#### 5.2 User Login
- ✅ Login with valid credentials
- ✅ Handle invalid credentials
- ✅ Generate JWT token
- ✅ Store session

#### 5.3 Session Management
- ✅ Check authentication status
- ✅ Get current user
- ✅ Logout user
- ✅ Handle expired tokens

### 6. Sync Operations

#### 6.1 Upload Metadata
- ✅ Upload file metadata to cloud
- ✅ Handle network errors
- ✅ Handle authentication errors

#### 6.2 Download Metadata
- ✅ Download file metadata from cloud
- ✅ Handle conflicts
- ✅ Merge with local data

#### 6.3 Conflict Resolution
- ✅ Last-write-wins strategy
- ✅ Handle simultaneous edits
- ✅ Resolve conflicts correctly

### 7. UI/UX Tests

#### 7.1 Main Interface
- ✅ Display current file
- ✅ Show progress indicator
- ✅ Handle empty state
- ✅ Handle scanning state
- ✅ Handle error states

#### 7.2 Media Viewer
- ✅ Display images
- ✅ Display PDFs (multi-page)
- ✅ Display TXT files
- ✅ Display DOCX files
- ✅ Display videos
- ✅ Display audio
- ✅ Handle unsupported formats

#### 7.3 Action Buttons
- ✅ Keep button functionality
- ✅ Reject button functionality
- ✅ Keyboard shortcuts (Arrow keys, K/R keys)
- ✅ Button hover states
- ✅ Button active states

#### 7.4 Authentication UI
- ✅ Login form validation
- ✅ Register form validation
- ✅ Error messages
- ✅ Success messages
- ✅ Loading states

### 8. Browser Compatibility

#### 8.1 File System Access API
- ✅ Chrome 86+ support
- ✅ Edge 86+ support
- ✅ Firefox fallback
- ✅ Safari fallback

#### 8.2 Browser Detection
- ✅ Detect browser type
- ✅ Detect browser version
- ✅ Detect capabilities
- ✅ Show appropriate UI

### 9. Performance Tests

#### 9.1 Large Directory Scanning
- ✅ Scan directory with 1000+ files
- ✅ Handle large files (100MB+)
- ✅ Efficient queue management
- ✅ Memory usage

#### 9.2 Database Performance
- ✅ Fast queries
- ✅ Efficient indexing
- ✅ Transaction performance

### 10. Security Tests

#### 10.1 Authentication Security
- ✅ Password hashing
- ✅ JWT token validation
- ✅ Session expiration
- ✅ CSRF protection

#### 10.2 File System Security
- ✅ Validate file paths
- ✅ Prevent directory traversal
- ✅ Validate file types
- ✅ Sanitize filenames

## Running Tests

```bash
# Install dependencies
npm install

# Run all tests
npm run test

# Run tests with UI
npm run test:ui

# Run tests with coverage
npm run test:coverage
```

## Test Data Cleanup

After testing is complete, delete the test data folder:

```powershell
Remove-Item -Recurse -Force test_data
```
