# Contributing to AssembleJS

Thank you for your interest in contributing to AssembleJS! By participating in this project, you're joining a movement to redefine how modern web applications are built.

AssembleJS represents a paradigm shift in UI development—one that embraces the true spirit of component architecture while delivering unprecedented flexibility, performance, and developer experience. Your contributions will help shape the future of web development.

## Code of Conduct

By participating in this project, you agree to maintain a respectful and inclusive environment for everyone. Please report any unacceptable behavior to the project maintainers.

## Getting Started

1. **Fork the repository** on GitHub
2. **Clone your fork** to your local machine
3. **Set up the development environment** as described in [DOCUMENTATION.md](DOCUMENTATION.md#development-setup)
4. **Create a new branch** for your feature or bug fix

## Making Changes

### Branching Strategy

- Use feature branches named according to the pattern: `feature/your-feature-name`
- For bug fixes, use: `fix/issue-description`

### Coding Standards

- Write clean, maintainable, and testable code
- Follow the existing code style and patterns
- Add meaningful comments where necessary
- Update documentation for any new features or changes to existing functionality

### Commit Guidelines

We follow the [Conventional Commits](https://www.conventionalcommits.org/) specification. Use the provided commit tool to ensure your commits follow this format:

```bash
npm run commit
```

This will guide you through the commit process, ensuring your commits are properly formatted.

#### Commit Types and Versioning

AssembleJS uses semantic-release for automated versioning and publishing. The commit type determines the version increment:

- `fix:` commits trigger PATCH releases (e.g., 1.0.0 → 1.0.1)
- `feat:` commits trigger MINOR releases (e.g., 1.0.0 → 1.1.0)
- `feat!:` or `fix!:` or commits with `BREAKING CHANGE:` in the footer trigger MAJOR releases (e.g., 1.0.0 → 2.0.0)
- Other types like `docs:`, `chore:`, `refactor:`, etc. won't trigger a release

Examples:
```
feat: add new component generator
fix: resolve issue with server-side rendering
feat!: redesign component API (BREAKING CHANGE)
docs: update API documentation
chore: update dependencies
```

### Pull Requests

1. **Always target the `next` branch with your Pull Requests**
   - PRs to `main` will be automatically flagged with a warning
   - Our CI system will mark PRs that incorrectly target `main` with the `invalid-target` label
   - If you change a PR's target branch from `main` to `next`, the warning is automatically removed
   - Create your feature branch from `next`: `git checkout -b feature/your-feature next`

2. Update your fork to include the latest changes from the repository
3. Push your changes to your fork on GitHub
4. Submit a pull request to the `next` branch
5. Include a clear description of the changes and any relevant issue numbers
6. Be responsive to feedback and be prepared to make additional changes if requested

### Promoting Changes to Production

To release changes to production (moving from `next` to `main`):

1. Go to "Actions" tab in GitHub
2. Select the "Promote Next to Main" workflow
3. Click "Run workflow" button
4. Enter a descriptive merge commit message
5. Click "Run workflow" to start the process

This workflow will create a merge commit from `next` to `main` and trigger the release process.

## Types of Contributions

### Bug Reports

Before submitting a bug report:

- Check the issue tracker to see if the bug has already been reported
- Verify that you're using the latest version of AssembleJS
- Include detailed steps to reproduce the bug
- Provide relevant information about your environment

### Feature Requests

Feature requests are welcome! Please provide:

- A clear and detailed description of the feature
- The motivation behind the feature
- Examples of how the feature would be used

### Documentation

Documentation improvements are always welcome, including:

- Fixing typos or grammar issues
- Adding missing documentation
- Clarifying existing documentation
- Adding examples or use cases

### Code Contributions

Code contributions might include:

- Bug fixes
- New features
- Performance improvements
- Code refactoring
- Test coverage improvements

## Development Workflow

See [DOCUMENTATION.md](DOCUMENTATION.md#development-workflow) for detailed instructions on setting up your development environment and workflow.

## Release Process

AssembleJS uses [semantic-release](https://github.com/semantic-release/semantic-release) for automated versioning and package publishing. This ensures:

1. Version numbers follow [Semantic Versioning](https://semver.org/)
2. Releases are triggered automatically when changes are merged to main
3. Release notes and changelogs are generated automatically

### Release Branch Strategy

AssembleJS follows a simple two-branch release strategy:

- `next`: Pre-release branch (e.g., 1.1.0-next.1, 1.1.0-next.2)
- `main`: Production release branch (e.g., 1.0.0, 1.1.0)

**Development Flow:**

1. Feature branches are created from and merged back to the `next` branch via pull requests
2. The `next` branch automatically publishes pre-releases to npm with the `next` tag
3. When ready for production, the `next` branch is merged to `main` using the "Promote Next to Main" workflow
4. The `main` branch automatically publishes production releases to npm with the `latest` tag

**Important:** The `main` branch should only ever receive merges from the `next` branch.

The CI pipeline handles testing and releasing automatically - no manual version updates or publishing is needed.

## License

By contributing to AssembleJS, you agree that your contributions will be licensed under the project's MIT license.

## Questions?

If you have questions about contributing to AssembleJS, please open an issue on GitHub or contact the project maintainers.

Thank you for your contributions to AssembleJS!