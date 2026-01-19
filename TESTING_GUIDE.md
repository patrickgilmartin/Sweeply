# Comprehensive Testing Guide

This guide provides instructions for rigorous testing of the Media Cleanup web application before deployment.

## Quick Start

1. **Install Dependencies**
   ```bash
   cd packages/web
   npm install
   ```

2. **Run All Tests**
   ```bash
   # Windows PowerShell
   .\run-tests.ps1
   
   # Linux/Mac
   chmod +x run-tests.sh
   ./run-tests.sh
   
   # Or directly with npm
   npm run test
   ```

3. **View Test UI** (for detailed results)
   ```bash
   npm run test:ui
   ```

4. **Generate Coverage Report**
   ```bash
   npm run test:coverage
   ```

## Test Structure

### Test Files Location
All test files are located in `packages/web/src/__tests__/`:
- `database.test.ts` - Database operations tests
- `fileScanner.test.ts` - File scanning tests
- `fileOperations.test.ts` - File operations tests
- `utils.test.ts` - Utility functions tests
- `integration.test.ts` - Integration workflow tests
- `errorHandling.test.ts` - Error scenarios tests
- `scenarios.test.ts` - Real-world scenario tests
- `ui.test.tsx` - UI component tests
- `setup.ts` - Test environment setup

### Test Data Location
Test data is located in `test_data/` directory (can be safely deleted after testing):
- `images/` - Test image files
- `documents/` - Test document files
- `videos/` - Test video files
- `audio/` - Test audio files
- `subfolder/` - Nested folder for recursive scanning
- `.hidden_folder/` - Hidden folder for exclusion tests

## Test Scenarios

### 1. Database Operations ✅
- File storage and retrieval
- Status updates
- Queue management
- Statistics calculation
- Rejected files tracking

### 2. File Scanning ✅
- Extension detection
- File filtering
- Hidden file exclusion
- Size filtering
- Recursive directory scanning

### 3. File Operations ✅
- Keep file workflow
- Reject file workflow
- File moving operations
- Export rejected files

### 4. Error Handling ✅
- Missing files
- Invalid paths
- Permission errors
- Network errors
- Edge cases (long paths, special characters, unicode)

### 5. Integration Workflows ✅
- Complete review workflow
- Session resumption
- Queue management
- Statistics tracking

### 6. UI/UX Validation ✅
- Component rendering
- User interactions
- Keyboard shortcuts
- Responsive design
- Loading states
- Error states

### 7. Browser Compatibility ✅
- File System Access API support
- Browser detection
- Fallback handling
- Cross-browser testing

## Manual Testing Checklist

### Pre-Deployment Testing

#### Authentication Flow
- [ ] Register new user
- [ ] Login with valid credentials
- [ ] Handle invalid credentials
- [ ] Logout functionality
- [ ] Session persistence

#### File System Access
- [ ] Request directory access (Chrome/Edge)
- [ ] Handle permission denied
- [ ] Browser not supported message (Firefox/Safari)
- [ ] Clear directory access

#### File Scanning
- [ ] Scan directory with various file types
- [ ] Handle nested folders
- [ ] Exclude hidden files
- [ ] Filter by file size
- [ ] Handle empty directories
- [ ] Handle very large directories

#### Media Display
- [ ] Display images correctly
- [ ] Display PDFs with multi-page scrolling
- [ ] Display TXT files
- [ ] Display DOCX files
- [ ] Display videos with controls
- [ ] Display audio with controls
- [ ] Handle unsupported formats

#### File Review
- [ ] Keep files (mark as kept)
- [ ] Reject files (move to deleted folder)
- [ ] Progress indicator updates
- [ ] Statistics update correctly
- [ ] Keyboard shortcuts work (Arrow keys, K/R keys)
- [ ] Button hover effects
- [ ] Button active states

#### Error Handling
- [ ] Handle missing files gracefully
- [ ] Handle permission errors
- [ ] Display clear error messages
- [ ] Allow recovery from errors

#### UI/UX
- [ ] Clean, modern interface
- [ ] Smooth transitions
- [ ] Loading states
- [ ] Empty states
- [ ] Error states
- [ ] Responsive design
- [ ] Accessibility features

## Automated Testing

### Running Specific Test Suites

```bash
# Run only database tests
npm run test -- src/__tests__/database.test.ts

# Run only integration tests
npm run test -- src/__tests__/integration.test.ts

# Run only error handling tests
npm run test -- src/__tests__/errorHandling.test.ts

# Run only scenario tests
npm run test -- src/__tests__/scenarios.test.ts
```

### Test Coverage

Generate coverage report:
```bash
npm run test:coverage
```

View coverage in browser:
```bash
npm run test:ui
```

## Validation Checklist

### Code Quality
- [ ] No TypeScript errors
- [ ] No linting errors
- [ ] All tests passing
- [ ] Code coverage > 80%
- [ ] No console errors

### UI/UX Quality
- [ ] Clean, modern design
- [ ] Smooth animations
- [ ] Clear visual hierarchy
- [ ] Consistent spacing
- [ ] Appropriate colors
- [ ] Readable typography

### Functionality
- [ ] All features working
- [ ] Error handling robust
- [ ] Edge cases handled
- [ ] Performance acceptable
- [ ] Browser compatibility verified

### Security
- [ ] Authentication secure
- [ ] File paths validated
- [ ] Input sanitized
- [ ] Error messages don't leak information

## Cleanup After Testing

Once testing is complete, delete the test data folder:

```powershell
# Windows PowerShell
Remove-Item -Recurse -Force test_data

# Linux/Mac
rm -rf test_data
```

## Test Results Documentation

Update `TEST_RESULTS.md` with:
- Test execution date
- Test environment details
- Test results summary
- Coverage percentages
- Issues found
- Recommendations

## Notes

- Test data is minimal and safe to delete
- Tests use fake-indexeddb for database testing
- UI tests use React Testing Library
- Integration tests verify complete workflows
- Error handling tests cover edge cases
- Scenario tests simulate real-world usage

## Troubleshooting

### Tests Fail to Run
- Ensure all dependencies are installed: `npm install`
- Check Node.js version (requires 18+)
- Clear node_modules and reinstall if needed

### Database Tests Fail
- Check fake-indexeddb is installed
- Verify test setup file is correct
- Clear browser IndexedDB if testing manually

### UI Tests Fail
- Ensure jsdom is installed
- Check React Testing Library setup
- Verify component imports are correct

## Support

For issues or questions:
1. Check test output for error messages
2. Review test files for test cases
3. Check TEST_SCENARIOS.md for expected behavior
4. Review UI_UX_VALIDATION.md for UI requirements
