# Contributing to AssembleJS

Thank you for your interest in contributing to AssembleJS! This guide will help you get started with contributing to the project, whether you're fixing bugs, adding features, improving documentation, or helping in other ways.

## Code of Conduct

AssembleJS has adopted a Code of Conduct that we expect all contributors to adhere to. Please read [the full text](https://github.com/assemblejs/assemblejs/blob/main/CODE_OF_CONDUCT.md) to understand what actions will and will not be tolerated.

## Getting Started

### Project Structure

The AssembleJS repository is organized as a monorepo with the following packages:

- `core` - The core AssembleJS framework
- `cli` - Command-line tools for AssembleJS
- `renderers` - Framework-specific renderers (React, Vue, etc.)
- `build` - Build tools and configurations
- `docs` - Documentation sources
- `examples` - Example projects and demos

### Setting Up Your Development Environment

1. **Fork the Repository**
   
   Start by forking the [AssembleJS repository](https://github.com/assemblejs/assemblejs) on GitHub.

2. **Clone Your Fork**
   
   ```bash
   git clone https://github.com/YOUR_USERNAME/assemblejs.git
   cd assemblejs
   ```

3. **Install Dependencies**
   
   ```bash
   npm install
   ```

4. **Build the Project**
   
   ```bash
   npm run build
   ```

5. **Run Tests**
   
   ```bash
   npm test
   ```

## Development Workflow

### Branching Strategy

- `main` - The main development branch
- `release/*` - Release branches
- `feature/*` - Feature branches
- `bugfix/*` - Bug fix branches
- `docs/*` - Documentation updates

Always create your working branch from `main`:

```bash
git checkout main
git pull origin main
git checkout -b feature/my-awesome-feature
```

### Pull Request Process

1. **Make Your Changes**
   
   Make your changes in your feature branch.

2. **Follow Coding Standards**
   
   Ensure your code follows the project's coding standards:
   
   ```bash
   npm run lint
   ```

3. **Write Tests**
   
   Add tests for any new functionality and ensure all tests pass:
   
   ```bash
   npm test
   ```

4. **Update Documentation**
   
   Update documentation to reflect any changes.

5. **Commit Your Changes**
   
   Follow the commit message conventions (see below).

6. **Create a Pull Request**
   
   Push your changes to your fork and create a pull request to the main repository.

7. **Code Review**
   
   Maintainers will review your code and may request changes.

8. **Merge**
   
   Once approved, maintainers will merge your PR.

### Commit Message Conventions

AssembleJS follows the [Conventional Commits](https://www.conventionalcommits.org/) specification. Each commit message should be structured as follows:

```
<type>(<scope>): <description>

[optional body]

[optional footer(s)]
```

Types include:
- `feat`: A new feature
- `fix`: A bug fix
- `docs`: Documentation only changes
- `style`: Changes that do not affect the meaning of the code
- `refactor`: A code change that neither fixes a bug nor adds a feature
- `perf`: A code change that improves performance
- `test`: Adding missing tests or correcting existing tests
- `build`: Changes to the build process or dependencies
- `ci`: Changes to CI configuration files and scripts
- `chore`: Other changes that don't modify src or test files

Example:
```
feat(renderer): add support for Svelte components

This adds a new Svelte renderer that supports Svelte components in AssembleJS applications.

Closes #123
```

## Types of Contributions

### Bug Reports

If you find a bug, please report it using the GitHub issue tracker:

1. Search existing issues to see if it's already reported
2. Include a clear title and description
3. Provide steps to reproduce the issue
4. Include expected vs. actual behavior
5. Attach screenshots or code samples if applicable

### Feature Requests

For feature requests:

1. Use the GitHub issue tracker
2. Clearly describe the feature and its use case
3. Explain how it aligns with AssembleJS's philosophy
4. Provide examples of how it would be used

### Code Contributions

Code contributions should:

1. Focus on a single feature or bug fix
2. Include appropriate tests
3. Update relevant documentation
4. Follow code style guidelines
5. Pass all CI checks

### Documentation

Documentation improvements are highly valued:

1. Correct inaccuracies
2. Add examples and clarifications
3. Improve organization and structure
4. Fix typos and grammatical errors

### Testing

Help improve test coverage by:

1. Adding tests for untested code
2. Improving existing tests
3. Adding integration and end-to-end tests
4. Testing on different platforms and environments

## Development Guides

### Running the Development Server

To run the development server for testing your changes:

```bash
npm run dev
```

### Debugging

For debugging AssembleJS:

1. Use the `debug` npm package:
   
   ```typescript
   const debug = require('debug')('assemblejs:core');
   debug('Some debugging information');
   ```

2. Enable debugging in your environment:
   
   ```bash
   DEBUG=assemblejs:* npm run dev
   ```

### Performance Testing

For performance-sensitive changes:

1. Run the performance test suite:
   
   ```bash
   npm run test:perf
   ```

2. Compare before/after benchmarks for your changes

## Code Review Process

All submissions go through a code review process:

1. Maintainers review the code for:
   - Correctness
   - Test coverage
   - Performance impact
   - API design
   - Documentation
   - Compatibility

2. Automated checks validate:
   - Linting
   - Type checking
   - Test passing
   - Build success
   - Coverage thresholds

3. Feedback will be provided on your pull request

4. Changes may be requested before merging

## Community

### Discussion Forums

Join the community discussions:

- [GitHub Discussions](https://github.com/assemblejs/assemblejs/discussions)
- [Discord Server](https://discord.gg/assemblejs)
- [Stack Overflow](https://stackoverflow.com/questions/tagged/assemblejs)

### Regular Meetings

- **Community Calls**: Biweekly community video calls
- **Office Hours**: Weekly maintainer office hours
- **Working Groups**: Focused groups for specific areas

## Release Process

AssembleJS follows a predictable release process:

1. **Feature Freeze** - New features are frozen before a release
2. **Release Candidate** - RC versions are published for testing
3. **Stable Release** - Final releases after RC testing
4. **Post-Release** - Patch releases for critical issues

## Recognition

Contributors are recognized in multiple ways:

- **Contributors List** - All contributors are listed in the project
- **Release Notes** - Significant contributions are highlighted in releases
- **Maintainer Status** - Regular contributors may be invited to become maintainers

## Legal

### Contributor License Agreement

All contributors must sign the Contributor License Agreement (CLA) before their code can be merged.

### Copyright

All contributions are subject to the project's license (MIT). By contributing, you agree to license your work under the same license.

## Getting Help

If you need help with your contribution:

- Ask in the [Discord server](https://discord.gg/assemblejs) #contributors channel
- Comment on the relevant GitHub issue
- Ask in [GitHub Discussions](https://github.com/assemblejs/assemblejs/discussions)

## Related Links

- [Development Roadmap](development-roadmap)
- [Troubleshooting](troubleshooting)
- [GitHub Repository](https://github.com/assemblejs/assemblejs)