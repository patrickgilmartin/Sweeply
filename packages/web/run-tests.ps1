# Test Runner Script for Windows PowerShell
# Runs all tests and generates reports

Write-Host "🧪 Running Media Cleanup Web Application Tests..." -ForegroundColor Cyan
Write-Host ""

# Run unit tests
Write-Host "📦 Running unit tests..." -ForegroundColor Yellow
npm run test -- --run

# Run integration tests
Write-Host ""
Write-Host "🔗 Running integration tests..." -ForegroundColor Yellow
npm run test -- --run src/__tests__/integration.test.ts

# Run scenario tests
Write-Host ""
Write-Host "📋 Running scenario tests..." -ForegroundColor Yellow
npm run test -- --run src/__tests__/scenarios.test.ts

# Run error handling tests
Write-Host ""
Write-Host "⚠️  Running error handling tests..." -ForegroundColor Yellow
npm run test -- --run src/__tests__/errorHandling.test.ts

Write-Host ""
Write-Host "✅ All tests completed!" -ForegroundColor Green
Write-Host ""
Write-Host "To view detailed results, run: npm run test:ui" -ForegroundColor Cyan
