// Mock implementation of chalk
const createChalk = () => {
  // Create a chainable proxy
  const handler = {
    get(target, prop) {
      if (
        prop === "bold" ||
        prop === "underline" ||
        prop === "italic" ||
        prop === "red" ||
        prop === "green" ||
        prop === "blue" ||
        prop === "yellow" ||
        prop === "magenta" ||
        prop === "cyan" ||
        prop === "white" ||
        prop === "gray" ||
        prop === "black"
      ) {
        return new Proxy((string) => string, handler);
      }
      return target[prop];
    },
    apply(target, thisArg, args) {
      return args[0];
    },
  };

  return new Proxy((string) => string, handler);
};

const chalk = createChalk();

// Create the default chalk methods
chalk.red = (text) => text;
chalk.green = (text) => text;
chalk.blue = (text) => text;
chalk.yellow = (text) => text;
chalk.cyan = (text) => text;
chalk.magenta = (text) => text;
chalk.white = (text) => text;
chalk.gray = (text) => text;
chalk.black = (text) => text;
chalk.bold = (text) => text;
chalk.underline = (text) => text;
chalk.italic = (text) => text;

// Allow chaining
chalk.red.bold = (text) => text;
chalk.bold.red = (text) => text;
// ... and so on for other combinations

// Add any other needed chalk properties
chalk.visible = true;
chalk.level = 1;

// Add a dummy test to prevent Jest error
describe("Chalk mock", () => {
  it("should provide a mock implementation of chalk", () => {
    expect(chalk.red("test")).toBe("test");
    expect(chalk.bold.green("test")).toBe("test");
  });
});

// ES5 style module.exports
module.exports = chalk;
