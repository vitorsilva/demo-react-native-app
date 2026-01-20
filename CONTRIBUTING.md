# Contributing to SaborSpin

Thank you for your interest in contributing to SaborSpin! This document provides guidelines for contributing.

## Getting Started

### 1. Fork and Clone

```bash
# Fork the repository on GitHub, then clone your fork
git clone https://github.com/YOUR_USERNAME/saborspin.git
cd saborspin

# Add upstream remote
git remote add upstream https://github.com/vitorsilva/saborspin.git
```

### 2. Install Dependencies

```bash
cd demo-react-native-app
npm install
```

### 3. Create a Branch

```bash
git checkout -b feature/your-feature-name
# or
git checkout -b fix/bug-description
```

## Development Workflow

### Running Locally

```bash
cd demo-react-native-app

# Start development server
npm start

# Press 'w' for web mode (fastest iteration)
# Press 'a' for Android
# Press 'i' for iOS
```

### Testing

```bash
cd demo-react-native-app

# Run unit tests
npm test

# Run E2E tests
npm run test:e2e

# TypeScript check
npx tsc --noEmit

# Lint
npm run lint
```

### Code Style

- Use TypeScript with strict mode
- Follow existing code formatting
- Add comments for complex logic
- Use meaningful variable/function names

### Commit Messages

Follow conventional commit format:

```
type(scope): subject

body (optional)
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

**Examples:**
```
feat(ingredients): add bulk import functionality

fix(suggestions): correct variety calculation for short cooldowns

docs(readme): update installation instructions
```

### Pull Request Process

1. **Update your fork:**
```bash
git fetch upstream
git rebase upstream/main
```

2. **Run all checks:**
```bash
npm test && npx tsc --noEmit && npm run lint
```

3. **Push to your fork:**
```bash
git push origin feature/your-feature-name
```

4. **Create Pull Request** on GitHub

## Project Structure

```
saborspin/
├── demo-react-native-app/     # React Native app
│   ├── app/                   # Expo Router screens
│   ├── components/            # Reusable UI components
│   ├── lib/                   # Business logic
│   │   ├── database/          # SQLite operations
│   │   ├── business-logic/    # Algorithms
│   │   ├── store/             # Zustand state
│   │   └── telemetry/         # Observability
│   ├── types/                 # TypeScript definitions
│   └── e2e/                   # Playwright E2E tests
├── landing/                   # Landing page
└── docs/                      # Documentation
```

## Areas to Contribute

### Bug Fixes

1. Check if already reported in [Issues](https://github.com/vitorsilva/saborspin/issues)
2. Create a new issue with steps to reproduce
3. Create a PR with the fix

### New Features

1. Open an issue first to discuss
2. Get feedback before starting work
3. Follow the PR process above

### Documentation

- Fix typos
- Clarify confusing sections
- Add missing documentation
- Improve examples

### Testing

- Add tests for uncovered code
- Improve existing tests
- Add E2E test scenarios

## Questions?

- Open an issue with the `question` label
- Check the [FAQ](./docs/user-guide/faq.md)

## License

By contributing, you agree that your contributions will be licensed under the MIT License.
