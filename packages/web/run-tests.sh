#!/bin/bash

# Test Runner Script
# Runs all tests and generates reports

echo "🧪 Running Media Cleanup Web Application Tests..."
echo ""

# Run unit tests
echo "📦 Running unit tests..."
npm run test -- --run

# Run integration tests
echo ""
echo "🔗 Running integration tests..."
npm run test -- --run src/__tests__/integration.test.ts

# Run scenario tests
echo ""
echo "📋 Running scenario tests..."
npm run test -- --run src/__tests__/scenarios.test.ts

# Run error handling tests
echo ""
echo "⚠️  Running error handling tests..."
npm run test -- --run src/__tests__/errorHandling.test.ts

echo ""
echo "✅ All tests completed!"
echo ""
echo "To view detailed results, run: npm run test:ui"
