# Testing Documentation for Tokenized Fund Dashboard

This document explains the testing strategy and how to run the test suite for the Tokenized Fund Dashboard application.

## Testing Technology

The Tokenized Fund Dashboard uses the following testing technologies:

- **Vitest** - Fast testing framework compatible with Vite
- **React Testing Library** - DOM testing utilities for React components
- **@testing-library/jest-dom** - Custom DOM element matchers for assertions
- **MockedProvider** from Apollo Client - For mocking GraphQL requests

## Running Tests

The project includes several npm scripts for testing:

```bash
# Run all tests once
npm test

# Run tests in watch mode (tests rerun when files change)
npm run test:watch

# Run tests with coverage report
npm run test:coverage

# Run tests with UI
npm run test:ui
```

## Test Structure

Tests are organized following the same structure as the components they test:

- Unit tests for utility functions: `src/utils/__tests__/`
- Component tests: `src/components/__tests__/`
- Context tests: `src/contexts/__tests__/`

Each test file is named after the file it tests, with `.test.jsx` appended.

## Testing Patterns

### Component Testing

Components are tested in isolation using React Testing Library. The general pattern is:

1. Render the component with necessary props and mock data
2. Interact with the component using RTL's user-event or fireEvent
3. Assert the expected outcome

Example:

```jsx
it('displays the correct transaction type', () => {
  render(<TransactionTypeBadge type="MINT" />);
  expect(screen.getByText('Mint')).toBeInTheDocument();
});
```

### Context Testing

Contexts are tested by creating a test component that consumes the context and then asserting the expected behavior.

### Mock Data

Mock data is used to simulate API responses. For GraphQL queries, `MockedProvider` is used to intercept and mock the responses.

### Test Utils

Common testing utilities are available in `src/test/utils.jsx`:

- `renderWithProviders` - Renders a component with all necessary providers
- `renderWithApollo` - Renders a component with Apollo MockedProvider
- `renderWithRouter` - Renders a component with Router
- `waitForApolloMock` - Waits for Apollo mocks to resolve

## Writing New Tests

When writing new tests:

1. Create a new test file in the appropriate `__tests__` directory
2. Import the component/function to test
3. Create test cases using `describe`, `it`, and `test` functions
4. Use human-readable descriptions
5. Test both success and error cases
6. Mock external dependencies

## Best Practices

- Test component behavior, not implementation details
- Use accessible queries like `getByRole`, `getByLabelText`, etc.
- Always clean up after each test
- Use realistic mock data
- Write focused, atomic tests
- Include edge cases and error scenarios
- Add human-friendly comments to explain complex test logic 