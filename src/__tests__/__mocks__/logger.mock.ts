// Create a mock logger module
const mockLogger = {
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
  trace: jest.fn(),
};

// Export mock ConsoleLogger class
export class ConsoleLogger {
  constructor(options?: any) {}

  debug = jest.fn();
  info = jest.fn();
  warn = jest.fn();
  error = jest.fn();
  trace = jest.fn();
}

export const logger = jest.fn().mockReturnValue(mockLogger);

// Export the mock instance for direct access in tests
export const mockLoggerInstance = mockLogger;

// Add a test to prevent Jest from complaining about no tests
test("Mock logger file", () => {
  expect(true).toBe(true);
});
