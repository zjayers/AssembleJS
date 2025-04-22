# Security Policy for AssembleJS

## Reporting Security Issues

If you believe you have found a security vulnerability in AssembleJS, we encourage you to let us know right away. We will investigate all legitimate reports and do our best to quickly fix the problem.

Please report security vulnerabilities by:

1. Opening an issue on our GitHub repository: https://github.com/zjayers/assemblejs/issues
2. Label the issue as `security` and provide a detailed description

Alternatively, if the security issue is sensitive, you can email the project maintainer directly at: [security@assemblejs.com](mailto:security@assemblejs.com)

## Security Guidelines

When using AssembleJS in production environments, please follow these security best practices:

1. **Keep AssembleJS Updated**: Always use the latest version to benefit from security patches and updates.

2. **Secure Server Configuration**: When deploying AssembleJS servers, ensure proper network security measures are in place.

3. **Content Security Policy**: Implement appropriate CSP headers for your AssembleJS applications.

4. **Input Validation**: Always validate and sanitize user inputs when building controllers or factories.

5. **Authentication & Authorization**: Implement proper authentication and authorization for AssembleJS applications that handle sensitive data.

## Supported Versions

Security updates will be provided for the following versions:

| Version | Supported          |
| ------- | ------------------ |
| 0.0.x   | :white_check_mark: |

As AssembleJS is currently in alpha stage, security patches will be applied to the latest release.

## Security Measures

AssembleJS implements several security measures by default:

- Helmet integration for secure HTTP headers
- CORS protection
- XSS protection through appropriate content encoding
- Rate limiting capabilities

## Disclosure Policy

When we receive a security bug report, we will:

1. Confirm the vulnerability and determine its impact
2. Develop a fix and test it thoroughly
3. Release a patch as soon as possible
4. Acknowledge the reporter in our release notes (if they wish to be credited)

We aim to respond to security reports within 48 hours and issue patches as quickly as possible depending on the complexity of the issue.