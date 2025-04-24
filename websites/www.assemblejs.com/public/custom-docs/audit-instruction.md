# Documentation Audit Instructions

This document outlines common issues found in the AssembleJS documentation and provides guidelines for fixing them. Use this as a reference when adding or updating documentation.

## Common Issues to Check

### 1. Import Statements
- **Issue**: Using `'assemblejs'` instead of `'asmbl'` in import statements
- **Fix**: Replace all imports to use the correct package name
  ```javascript
  // INCORRECT
  import { Blueprint } from 'assemblejs';
  
  // CORRECT
  import { Blueprint } from 'asmbl';
  ```

### 2. File Naming and Organization
- **Issue**: Inconsistent file naming patterns
- **Fix**: 
  - Use kebab-case (hyphen-separated) for all file names
  - Use appropriate prefixes for documentation categories:
    - Core concepts: `core-concepts-*.md`
    - API documentation: `api-*.md`
    - Tutorials: `tutorial-*.md`

### 3. Documentation Links
- **Issue**: Broken links between documentation files
- **Fix**: 
  - Ensure all internal links use the correct path
  - Always use relative paths when linking to other documentation files
  - Verify that target files actually exist
  ```markdown
  <!-- CORRECT -->
  [Core Concepts](core-concepts-blueprints.md)
  
  <!-- INCORRECT (file doesn't follow naming convention) -->
  [Core Concepts](core_concepts/blueprints.md)
  ```

### 4. Terminology Consistency
- **Issue**: Inconsistent capitalization and terminology
- **Fix**:
  - Use "AssembleJS" in prose (not "Assemblejs" or "assemblejs")
  - Use "asmbl" for package references
  - Maintain consistent naming for key concepts:
    - "Blueprint" (not "blueprint")
    - "Component" (not "component")
    - "ServerContext" (not "Server Context")

### 5. Code Examples
- **Issue**: Outdated or incorrect code examples
- **Fix**:
  - Ensure all code examples use the current API
  - Provide complete, runnable examples when possible
  - Include comments to explain complex code sections
  - Test code examples when possible to verify they work

## Specific Files Requiring Attention

### Import Statement Fixes:
- `/custom-docs/advanced-cross-framework-state.md` - Replace 'assemblejs' imports
- `/custom-docs/advanced-component-lifecycle.md` - Replace 'assemblejs' imports
- `/custom-docs/core-concepts-renderers.md` - Replace 'assemblejs' imports
- `/custom-docs/development-workflow.md` - Replace 'assemblejs' imports

### Broken Links to Fix:
- `/custom-docs/quick-start.md` - Fix links to core concepts and tutorials
- `/custom-docs/development-workflow.md` - Fix references to non-existent guides

### Missing Documentation to Create:
- `/custom-docs/tutorials/storefront.md` - Create or update references
- `/custom-docs/performance-optimization.md` - Create or update references
- `/custom-docs/testing-guide.md` - Create or update references

## Documentation Review Process

When reviewing documentation, follow this checklist:

1. **Accuracy**: Does the documentation correctly describe the feature or API?
2. **Completeness**: Does it cover all aspects of the topic?
3. **Clarity**: Is the documentation clear and easy to understand?
4. **Examples**: Are there useful, working examples?
5. **Links**: Do all links work and point to the correct resources?
6. **Terminology**: Is terminology used consistently?
7. **Formatting**: Is the document properly formatted?

## Contributing to Documentation

When contributing new documentation:

1. Follow the existing structure and naming conventions
2. Use Markdown formatting consistently
3. Include a brief description at the top of the file
4. Add working code examples where appropriate
5. Include links to related documentation
6. Test all code examples and links before submitting

## Documentation Standards

- Use American English spelling
- Write in present tense
- Use active voice
- Avoid jargon and overly technical language
- Use code blocks for all code examples with appropriate syntax highlighting
- Include a table of contents for longer documents

By following these guidelines, we can ensure our documentation remains consistent, accurate, and useful for all AssembleJS users.