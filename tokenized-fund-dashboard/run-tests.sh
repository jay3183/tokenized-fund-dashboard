#!/bin/bash

# Run tests with coverage
echo "🧪 Running tests with coverage..."
npm run test:coverage

# Check if tests passed
if [ $? -eq 0 ]; then
  echo "✅ All tests passed successfully!"
  
  # Open coverage report in browser if on Mac
  if [[ "$OSTYPE" == "darwin"* ]]; then
    echo "📊 Opening coverage report..."
    open ./coverage/index.html
  else
    echo "📊 Coverage report available at ./coverage/index.html"
  fi
else
  echo "❌ Some tests failed. Please check the error messages above."
fi

echo ""
echo "🔍 Summary of test files:"
find ./src -name "*.test.jsx" | sort 