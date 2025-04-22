# AssembleJS Integration Tests

This directory contains integration tests for AssembleJS components and features. These tests verify the correct interaction between multiple modules and external dependencies.

## Test Structure

The integration tests are organized into the following categories:

1. **Logger Integration Tests** - Tests for the logging system
2. **Component System Tests** - Tests for the component lifecycle and rendering
3. **HTTP/API Tests** - Tests for HTTP interactions and API functionality
4. **Factory System Tests** - Tests for data transformation operations
5. **Generator Tests** - End-to-end tests for the generator functionality

## Running Integration Tests

Integration tests can be run separately from unit tests with:

```bash
npm run test:integration
```

These tests may take longer to run than unit tests due to their nature of testing multiple components together and interaction with external systems.

## Test Requirements

Some integration tests may require:

- A running server instance
- Test-specific configuration
- Cleanup procedures to reset state between tests

## Adding New Integration Tests

When adding new integration tests:

1. Create a new file in the appropriate subdirectory
2. Use the naming convention `[feature].integration.test.ts`
3. Document any special setup requirements in the test file
4. Ensure all tests clean up after themselves
