# AssembleJS End-to-End Tests

This directory contains end-to-end tests for AssembleJS features. These tests verify the full functionality of the framework from a user's perspective.

## Test Structure

The end-to-end tests are organized into the following categories:

1. **Generator Tests** - Tests for the CLI generator commands
2. **Server Tests** - Tests for server startup and operation
3. **Component Tests** - Tests for component rendering and interaction
4. **API Tests** - Tests for HTTP API functionality

## Running E2E Tests

End-to-end tests can be run with:

```bash
npm run test:e2e
```

## Test Requirements

End-to-end tests require:

- A clean test environment
- Temporary test directories
- Access to CLI commands

## Adding New E2E Tests

When adding new end-to-end tests:

1. Create a new file in the appropriate subdirectory
2. Use the naming convention `[feature].e2e.test.ts`
3. Document any special setup requirements
4. Ensure all tests clean up temporary files after execution
