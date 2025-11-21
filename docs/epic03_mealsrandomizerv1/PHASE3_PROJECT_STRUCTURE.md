# Phase 3: Project Structure & Documentation

[← Back to Overview](./OVERVIEW.md) | [Previous: Phase 2](./PHASE2_BRANDING_IDENTITY.md)

---

## 🎯 Goal

Transform the repository from a learning-focused project to a professional, production-ready codebase with clear documentation and proper structure.

**Current State:** Documentation mixes learning notes with product information. Code comments reference learning concepts.

**After Phase 3:** Clear separation between learning materials and product documentation. Professional README and contribution guidelines. Codebase ready for open source.

---

## 📋 What You'll Build

### 1. Documentation Reorganization
- Move all learning docs to `/docs/learning/`
- Create user-facing documentation in `/docs/user-guide/`
- Create API/developer docs in `/docs/api/`
- Archive completed learning phases

### 2. Professional Documentation
- Rewrite README.md (user-focused)
- Create CONTRIBUTING.md (developer-focused)
- Add CODE_OF_CONDUCT.md
- Create CHANGELOG.md
- Add LICENSE file

### 3. Code Cleanup
- Remove learning-focused comments
- Add professional inline documentation
- Update code comments to be maintainer-focused
- Clean up test descriptions

### 4. Repository Organization
- Add .github/ folder with templates
- Create issue templates
- Create pull request template
- Add discussion categories

---

## 🛠️ Implementation Steps

### Step 3.1: Reorganize Documentation (1 hour)

**What you'll learn:** Documentation architecture, information architecture

**New Documentation Structure:**

```
docs/
├── learning/                         # Learning materials (archived)
│   ├── README.md                     # "This is learning material"
│   ├── epic01_infrastructure/
│   │   ├── LEARNING_PLAN.md
│   │   └── PHASE*_LEARNING_NOTES.md
│   ├── epic02_mealsrandomizer/
│   │   ├── OVERVIEW.md
│   │   ├── PHASE*_*.md
│   │   └── PHASE*_SESSION_NOTES.md
│   └── epic03_mealsrandomizerv1/
│       ├── OVERVIEW.md
│       └── PHASE*_*.md
│
├── user-guide/                       # User documentation
│   ├── README.md                     # Getting started
│   ├── installation.md               # How to install
│   ├── getting-started.md            # First-time user guide
│   ├── customization.md              # Adding ingredients/categories
│   ├── settings.md                   # Settings explained
│   ├── faq.md                        # Frequently asked questions
│   └── troubleshooting.md            # Common issues
│
├── api/                              # Developer documentation
│   ├── README.md                     # API overview
│   ├── database-schema.md            # Database structure
│   ├── state-management.md           # Zustand store guide
│   ├── algorithms.md                 # How algorithms work
│   ├── observability.md              # Telemetry guide
│   └── testing.md                    # Testing guide
│
├── design/                           # Design assets & guidelines
│   ├── brand-guidelines.md           # Brand colors, fonts, etc.
│   ├── ui-components.md              # Component library
│   └── assets/                       # Design files (Figma links)
│
└── README.md                         # Documentation index
```

**Tasks:**
1. Create new folder structure
2. Move existing learning docs to `/docs/learning/`
3. Create placeholder README files in each section
4. Update internal links in moved files
5. Add warning banner to learning docs (archived material)

**Example learning/README.md:**
```markdown
# Learning Materials (Archived)

This folder contains learning materials from the development of MealMix. These documents were created during the learning process and are kept for reference.

**If you're looking to:**
- Use the app → See [User Guide](../user-guide/)
- Contribute → See [CONTRIBUTING.md](../../CONTRIBUTING.md)
- Understand the code → See [API Documentation](../api/)

These learning materials show the incremental development process and may reference outdated code or approaches.
```

---

### Step 3.2: Create User Guide (1-2 hours)

**What you'll learn:** Technical writing for end users

**File: docs/user-guide/getting-started.md**

Content:
- Download and installation
- First launch walkthrough
- Adding your first ingredient
- Generating your first suggestions
- Logging your first meal
- Understanding the history

**File: docs/user-guide/customization.md**

Content:
- Managing ingredients
- Creating categories
- Defining meal types
- Configuring cooldown periods
- Import/export data (future)

**File: docs/user-guide/faq.md**

Common questions:
- How does the variety enforcement work?
- Can I use this for lunch/dinner?
- How do I delete my data?
- Does this sync across devices?
- How is my data stored?
- Is my data private?

**File: docs/user-guide/troubleshooting.md**

Common issues:
- App won't open
- No suggestions appearing
- Ingredients not saving
- Database errors
- Build issues (for advanced users)

---

### Step 3.3: Create API Documentation (1 hour)

**What you'll learn:** Documenting code architecture

**File: docs/api/database-schema.md**

Document:
- All tables and columns
- Relationships (foreign keys)
- Indexes
- Constraints
- Migration history

Example:
```markdown
# Database Schema

## Tables

### ingredients
Stores all ingredients (seeded and user-added).

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | INTEGER | PRIMARY KEY | Auto-increment ID |
| name | TEXT | NOT NULL, UNIQUE | Ingredient name |
| category_id | INTEGER | FOREIGN KEY | References categories(id) |
| is_active | INTEGER | DEFAULT 1 | 0=disabled, 1=enabled |
| is_user_added | INTEGER | DEFAULT 0 | 0=seeded, 1=user-added |
| created_at | TEXT | DEFAULT CURRENT_TIMESTAMP | Creation timestamp |
| updated_at | TEXT | DEFAULT CURRENT_TIMESTAMP | Last update timestamp |

**Indexes:**
- `idx_ingredients_category` on `category_id`
- `idx_ingredients_active` on `is_active`
```

**File: docs/api/state-management.md**

Document:
- Zustand store structure
- All state variables
- All actions
- When to use each action
- State update patterns

**File: docs/api/algorithms.md**

Document:
- Combination generation algorithm
- Variety enforcement logic
- Cooldown calculation
- Score calculation
- Configuration parameters

---

### Step 3.4: Create CONTRIBUTING.md (1 hour)

**What you'll learn:** Open source contribution guidelines

**Structure:**

```markdown
# Contributing to MealMix

Thank you for your interest in contributing! This document provides guidelines for contributing to MealMix.

## Code of Conduct

Please read and follow our [Code of Conduct](./CODE_OF_CONDUCT.md).

## Getting Started

### Prerequisites
- Node.js 20+
- npm or yarn
- Expo CLI
- (Optional) Android Studio or Xcode

### Setup
1. Fork the repository
2. Clone your fork: `git clone https://github.com/YOUR_USERNAME/mealmix.git`
3. Install dependencies: `npm install`
4. Start dev server: `npm start`

### Development Workflow
1. Create a branch: `git checkout -b feature/your-feature-name`
2. Make your changes
3. Write/update tests
4. Run tests: `npm test`
5. Run linter: `npm run lint`
6. Commit with conventional commits: `git commit -m "feat: add feature"`
7. Push: `git push origin feature/your-feature-name`
8. Open a Pull Request

## Development Guidelines

### Code Style
- Follow ESLint configuration
- Use TypeScript strict mode
- Prefer functional components
- Use meaningful variable names

### Testing
- Write tests for new features
- Maintain >70% code coverage
- Test on both iOS and Android
- Include E2E tests for user flows

### Commits
Use conventional commits:
- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation only
- `test:` - Adding tests
- `refactor:` - Code restructuring
- `chore:` - Maintenance tasks

### Pull Requests
- Keep PRs focused (one feature/fix per PR)
- Include tests
- Update documentation
- Add screenshots for UI changes
- Link related issues

## Project Structure

See [docs/api/](./docs/api/) for detailed architecture documentation.

## Questions?

- Check [FAQ](./docs/user-guide/faq.md)
- Search existing issues
- Open a new discussion

## License

By contributing, you agree that your contributions will be licensed under the MIT License.
```

---

### Step 3.5: Add CODE_OF_CONDUCT.md (15 min)

**What you'll learn:** Community standards

Use the Contributor Covenant template:

**File: CODE_OF_CONDUCT.md**

```markdown
# Contributor Covenant Code of Conduct

## Our Pledge

We as members, contributors, and leaders pledge to make participation in our
community a harassment-free experience for everyone, regardless of age, body
size, visible or invisible disability, ethnicity, sex characteristics, gender
identity and expression, level of experience, education, socio-economic status,
nationality, personal appearance, race, religion, or sexual identity
and orientation.

## Our Standards

Examples of behavior that contributes to a positive environment:
- Using welcoming and inclusive language
- Being respectful of differing viewpoints
- Gracefully accepting constructive criticism
- Focusing on what is best for the community
- Showing empathy towards other community members

Examples of unacceptable behavior:
- Trolling, insulting/derogatory comments, and personal attacks
- Public or private harassment
- Publishing others' private information without permission
- Other conduct which could reasonably be considered inappropriate

## Enforcement

Instances of abusive, harassing, or otherwise unacceptable behavior may be
reported to the project team at [your-email@example.com]. All complaints will
be reviewed and investigated promptly and fairly.

## Attribution

This Code of Conduct is adapted from the [Contributor Covenant][homepage],
version 2.0, available at
https://www.contributor-covenant.org/version/2/0/code_of_conduct.html

[homepage]: https://www.contributor-covenant.org
```

---

### Step 3.6: Create CHANGELOG.md (30 min)

**What you'll learn:** Version documentation

**File: CHANGELOG.md**

```markdown
# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- User customization features (ingredients, categories, meal types)
- Professional branding and app icon
- Landing page

## [0.2.0] - 2025-01-XX (Epic 2 Completion)

### Added
- SQLite database with cross-platform adapters
- Zustand state management
- Combination generator algorithm
- Variety enforcement engine
- Home screen with meal type navigation
- Suggestions screen with image cards
- Confirmation modal for meal logging
- Recent meals history display
- E2E tests with Playwright

### Fixed
- Database timing issues with useRef pattern
- Sentry web compatibility with Platform checks

## [0.1.0] - 2025-10-28 (Epic 1 Completion)

### Added
- Jest testing infrastructure
- ESLint and Prettier configuration
- GitHub Actions CI/CD pipeline
- OpenTelemetry observability stack
- Jaeger for distributed tracing
- Prometheus for metrics
- Sentry for error tracking
- Docker Compose for local observability services
- Pre-commit hooks with Husky

### Changed
- Migrated to Expo SDK 54
- Updated to React 19.1.0
- Enabled React Native new architecture

## [0.0.1] - Initial Learning Phase

### Added
- Basic Expo React Native project
- Hello World app
- EAS Build configuration
- APK generation capability

[Unreleased]: https://github.com/yourname/mealmix/compare/v0.2.0...HEAD
[0.2.0]: https://github.com/yourname/mealmix/compare/v0.1.0...v0.2.0
[0.1.0]: https://github.com/yourname/mealmix/compare/v0.0.1...v0.1.0
[0.0.1]: https://github.com/yourname/mealmix/releases/tag/v0.0.1
```

---

### Step 3.7: Add LICENSE (5 min)

**What you'll learn:** Open source licensing

**File: LICENSE**

Choose a license (MIT is common for open source):

```
MIT License

Copyright (c) 2025 [Your Name]

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

Resources:
- [Choose a License](https://choosealicense.com)
- [MIT License](https://opensource.org/licenses/MIT)
- [Apache 2.0](https://opensource.org/licenses/Apache-2.0)
- [GPL v3](https://www.gnu.org/licenses/gpl-3.0.en.html)

---

### Step 3.8: Rewrite README.md (1 hour)

**What you'll learn:** Project presentation

**Structure:**

```markdown
<div align="center">
  <img src="./assets/images/icon.png" alt="MealMix Logo" width="120" />
  <h1>MealMix</h1>
  <p><strong>Eliminate meal decision fatigue with variety-enforced suggestions</strong></p>

  [![CI](https://github.com/yourname/mealmix/workflows/CI/badge.svg)](https://github.com/yourname/mealmix/actions)
  [![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
  [![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](./CONTRIBUTING.md)
</div>

---

## 🎯 What is MealMix?

MealMix helps you decide what to eat for breakfast and snacks without repeating meals too often. Get 4 personalized suggestions in seconds based on your preferences and eating history.

**Problem:** Decision fatigue around daily meals. Eating the same things repeatedly.

**Solution:** Variety-enforced meal suggestions that prevent repetition while respecting your preferences.

[See it in action →](https://mealmix.example.com) (landing page link)

---

## ✨ Features

- 🎲 **Variety Enforced** - Algorithm prevents repeating ingredients within your cooldown period
- ⚡ **Fast Decisions** - Pick a meal in under 20 seconds
- 🎨 **Fully Customizable** - Add your own ingredients, categories, and meal types
- 📊 **Meal Tracking** - See your eating history and patterns
- 🌙 **Dark Mode** - Easy on the eyes, day or night
- 🔒 **Privacy First** - All data stored locally, no cloud sync
- 📱 **Cross-Platform** - iOS, Android, and Web

---

## 📸 Screenshots

[Add screenshots here]

---

## 🚀 Download

### iOS
Coming soon to the App Store

### Android
- **[Download APK](link)** (v1.0.0)
- Coming soon to Google Play Store

### Web
Try it now: [mealmix.example.com](https://mealmix.example.com)

---

## 🛠️ Built With

- **[React Native](https://reactnative.dev)** + **[Expo](https://expo.dev)** - Mobile framework
- **[SQLite](https://www.sqlite.org)** - Local-first database
- **[Zustand](https://zustand.pmnd.rs)** - State management
- **[OpenTelemetry](https://opentelemetry.io)** - Observability
- **[Playwright](https://playwright.dev)** - E2E testing
- **[TypeScript](https://www.typescriptlang.org)** - Type safety

---

## 📖 Documentation

- **[User Guide](./docs/user-guide/)** - How to use MealMix
- **[API Documentation](./docs/api/)** - Technical documentation
- **[Contributing](./CONTRIBUTING.md)** - How to contribute
- **[Changelog](./CHANGELOG.md)** - Version history

---

## 🤝 Contributing

Contributions are welcome! Please read our [Contributing Guide](./CONTRIBUTING.md) and [Code of Conduct](./CODE_OF_CONDUCT.md).

### Quick Start for Developers

```bash
# Clone the repo
git clone https://github.com/yourname/mealmix.git
cd mealmix

# Install dependencies
npm install

# Start development server
npm start

# Run tests
npm test

# Run E2E tests
npm run test:e2e
```

See [CONTRIBUTING.md](./CONTRIBUTING.md) for detailed setup instructions.

---

## 📊 Project Status

- ✅ **Epic 1:** Infrastructure & Foundation - Complete
- ✅ **Epic 2:** Meals Randomizer Features - Complete
- 🔄 **Epic 3:** Production Readiness - In Progress
  - ✅ Phase 1: User Customization - Complete
  - ✅ Phase 2: Branding & Identity - Complete
  - 🔄 Phase 3: Project Structure - In Progress

See [CHANGELOG.md](./CHANGELOG.md) for detailed version history.

---

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](./LICENSE) file for details.

---

## 🙏 Acknowledgments

- Inspired by decision fatigue research
- Built as a learning project, evolved into a product
- Thanks to the React Native and Expo communities

---

## 📧 Contact

- **Website:** [mealmix.example.com](https://mealmix.example.com)
- **Issues:** [GitHub Issues](https://github.com/yourname/mealmix/issues)
- **Discussions:** [GitHub Discussions](https://github.com/yourname/mealmix/discussions)

---

<div align="center">
  Made with ❤️ and lots of breakfast decisions
</div>
```

---

### Step 3.9: GitHub Templates (30 min)

**What you'll learn:** GitHub repository organization

**Create .github/ folder:**

**File: .github/ISSUE_TEMPLATE/bug_report.md**
```markdown
---
name: Bug report
about: Create a report to help us improve
title: '[BUG] '
labels: bug
assignees: ''
---

**Describe the bug**
A clear description of what the bug is.

**To Reproduce**
Steps to reproduce:
1. Go to '...'
2. Click on '...'
3. See error

**Expected behavior**
What you expected to happen.

**Screenshots**
If applicable, add screenshots.

**Environment:**
- OS: [e.g. iOS 17.1, Android 14]
- App Version: [e.g. 1.0.0]
- Device: [e.g. iPhone 14, Pixel 7]

**Additional context**
Any other context about the problem.
```

**File: .github/ISSUE_TEMPLATE/feature_request.md**
```markdown
---
name: Feature request
about: Suggest an idea
title: '[FEATURE] '
labels: enhancement
assignees: ''
---

**Is your feature request related to a problem?**
A clear description of the problem.

**Describe the solution you'd like**
A clear description of what you want to happen.

**Describe alternatives you've considered**
Alternative solutions or features you've considered.

**Additional context**
Any other context or screenshots.
```

**File: .github/PULL_REQUEST_TEMPLATE.md**
```markdown
## Description
Brief description of changes.

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Checklist
- [ ] Tests added/updated
- [ ] Linter passes
- [ ] Documentation updated
- [ ] Screenshots attached (for UI changes)
- [ ] Tested on iOS and Android

## Screenshots (if applicable)

## Related Issues
Closes #(issue number)
```

---

### Step 3.10: Code Comment Cleanup (1 hour)

**What you'll learn:** Professional code documentation

**Remove learning-focused comments:**

Before:
```typescript
// This uses the Fisher-Yates shuffle algorithm we learned about in Phase 2
function shuffle<T>(array: T[]): T[] {
  // Remember: we start from the end and work backwards!
  for (let i = array.length - 1; i > 0; i--) {
    // ...
  }
}
```

After:
```typescript
/**
 * Shuffles array using Fisher-Yates algorithm
 * @param array - Array to shuffle
 * @returns New shuffled array (does not mutate original)
 */
function shuffle<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}
```

**Add JSDoc comments for public APIs:**
- All exported functions
- All React components (props)
- Database operations
- Business logic algorithms

---

## ✅ Success Criteria

### Documentation
- [ ] Learning materials moved to `/docs/learning/`
- [ ] User guide created and comprehensive
- [ ] API documentation complete
- [ ] README.md is professional and clear
- [ ] CONTRIBUTING.md guides new developers
- [ ] CODE_OF_CONDUCT.md in place
- [ ] CHANGELOG.md tracks versions
- [ ] LICENSE file added

### Repository Structure
- [ ] GitHub templates created
- [ ] Issue templates cover common cases
- [ ] PR template ensures quality
- [ ] .github/ folder organized

### Code Quality
- [ ] Learning comments removed
- [ ] JSDoc comments added
- [ ] Code is self-documenting
- [ ] Test descriptions are professional

### User Experience
- [ ] Documentation is easy to navigate
- [ ] New users can get started quickly
- [ ] New developers can contribute easily
- [ ] Project looks professional

---

## 🎓 Learning Outcomes

After completing Phase 3, you'll understand:
- Documentation architecture
- Technical writing for different audiences
- Open source best practices
- GitHub repository organization
- Code documentation standards
- Community building

---

## 🚀 Next Steps

After completing Phase 3:
1. Review all documentation for clarity
2. Get feedback from a friend (pretend they're a new user/contributor)
3. Move to [Phase 4: Polish Feature →](./PHASE4_POLISH_FEATURE.md) (optional)
4. Or declare Epic 3 complete!

---

[← Back to Overview](./OVERVIEW.md) | [Previous: Phase 2](./PHASE2_BRANDING_IDENTITY.md) | [Next: Phase 4 →](./PHASE4_POLISH_FEATURE.md)
