# Contributing to JIRA-AI Dependency Tracker

Thank you for your interest in contributing to JIRA-AI Dependency Tracker! This document provides guidelines and instructions for contributing to this project.

## Code of Conduct

Please read and follow our [Code of Conduct](CODE_OF_CONDUCT.md). We expect all contributors to adhere to this code to ensure a positive and respectful environment for everyone.

## How Can I Contribute?

### Reporting Bugs

Bug reports help us improve the project. When you submit a bug report, please include:

1. A clear and descriptive title
2. Steps to reproduce the bug
3. Expected behavior
4. Actual behavior
5. Screenshots (if applicable)
6. Environment details (OS, browser, etc.)

Use the bug report template when opening an issue.

### Suggesting Features

Feature suggestions are welcome! When submitting feature requests:

1. Use a clear and descriptive title
2. Provide a detailed description of the proposed feature
3. Explain why this feature would be useful to most users
4. Include mockups or examples if possible

Use the feature request template when opening an issue.

### Pull Requests

1. Fork the repository
2. Create a new branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Run tests to ensure your changes don't break existing functionality
5. Commit your changes (`git commit -m 'Add some amazing feature'`)
6. Push to the branch (`git push origin feature/amazing-feature`)
7. Open a Pull Request

#### Pull Request Guidelines

- Follow the coding style and conventions used in the project
- Write or update tests for the changes you make
- Update documentation as necessary
- Keep pull requests focused on a single feature or bug fix
- Link any relevant issues in the pull request description

## Development Setup

### Prerequisites

- Node.js 16+
- PostgreSQL 14+
- Julia 1.8+ (for advanced scientific models)

### Local Development

1. Clone the repository
   ```bash
   git clone https://github.com/yourusername/jira-ai-dependency-tracker.git
   cd jira-ai-dependency-tracker
   ```

2. Install dependencies
   ```bash
   npm install
   ```

3. Set up environment variables
   ```bash
   cp .env.example .env
   # Edit .env with your database and API credentials
   ```

4. Run database migrations
   ```bash
   npm run db:push
   ```

5. Start the development server
   ```bash
   npm run dev
   ```

### Testing

Run tests with:
```bash
npm test
```

## Scientific Model Contributions

For contributions to the Physics-Informed Neural Networks (PINNs) or other scientific models:

1. Provide theoretical background and references for your approach
2. Include validation metrics and benchmark comparisons 
3. Document the mathematical foundations in the code comments
4. Ensure Julia code follows Julia style conventions

## Documentation

- Update the README.md with details of changes to the interface
- Update the API documentation for any endpoint changes
- Add to user guides for new features

## Scientific Background Resources

If you're new to the scientific concepts used in this project:

- [Introduction to Physics-Informed Neural Networks](https://arxiv.org/abs/1711.10561)
- [Universal Differential Equations for Scientific Machine Learning](https://arxiv.org/abs/2001.04385)
- [The Julia Language Documentation](https://docs.julialang.org/)

## Contact

If you have questions or need help, you can:

- Open an issue on GitHub
- Reach out to the maintainers directly at maintainers@yourdomain.com

Thank you for contributing to JIRA-AI Dependency Tracker!