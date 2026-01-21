# SaborSpin Documentation

This directory contains all documentation for the SaborSpin project.

**Live App:** Coming soon to app stores
**Landing Page:** [saborspin.com](https://saborspin.com)

---

## Documentation Structure

```
docs/
├── README.md (this file)
├── product_info/                # Product exploration & mockups
│   ├── meals-randomizer-exploration.md
│   ├── icon/
│   └── mockups/
├── learning/                    # Learning journey (archived)
│   ├── epic01_infrastructure/
│   ├── epic02_mealsrandomizer/
│   └── epic03_mealsrandomizerv1/
├── architecture/                # System architecture
│   ├── SYSTEM_OVERVIEW.md
│   ├── DATABASE_SCHEMA.md
│   └── STATE_MANAGEMENT.md
├── developer-guide/             # Developer how-to guides
│   ├── INSTALLATION.md
│   ├── TESTING.md
│   ├── TELEMETRY.md
│   └── TROUBLESHOOTING.md
└── user-guide/                  # End-user documentation
    ├── getting-started.md
    ├── customization.md
    └── faq.md
```

---

## Quick Navigation

### By Purpose

**I want to use the app**
- [User Guide: Getting Started](./user-guide/getting-started.md)
- [User Guide: Customization](./user-guide/customization.md)
- [FAQ](./user-guide/faq.md)

**I want to contribute**
- [Contributing Guide](../CONTRIBUTING.md)
- [Installation](./developer-guide/INSTALLATION.md)
- [Architecture Overview](./architecture/SYSTEM_OVERVIEW.md)
- [Telemetry Guide](./developer-guide/TELEMETRY.md)

**I want to learn from this project**
- [Epic 1: Infrastructure](./learning/epic01_infrastructure/LEARNING_PLAN.md)
- [Epic 2: Meals Randomizer](./learning/epic02_mealsrandomizer/OVERVIEW.md)
- [Epic 3: Production Readiness](./learning/epic03_mealsrandomizerv1/OVERVIEW.md)

---

## Epic Overview

| Epic | Focus | Status | Completion |
|------|-------|--------|------------|
| Epic 1 | Infrastructure & Foundation | Complete | 100% |
| Epic 2 | Meals Randomizer Features | Complete | 100% |
| Epic 3 | Production Readiness | Complete | 100% |

### Epic Progression

```
Epic 1: Learn the tools
├─ Testing, CI/CD, Observability
└─ Infrastructure ready

Epic 2: Build the features
├─ SQLite, Zustand, UI
└─ Functional prototype

Epic 3: Ship the product
├─ User customization, branding
└─ Production-ready app
```

---

## Document Conventions

### Status Indicators

| Symbol | Meaning |
|--------|---------|
| Complete | Phase/feature finished |
| Planned | Documented but not executed |
| Deferred | Moved to different epic/phase |
| In Progress | Currently working |
| Ongoing | Continuous activity |

### File Naming

| Pattern | Purpose |
|---------|---------|
| `LEARNING_PLAN.md` | Epic overview and structure |
| `OVERVIEW.md` | Epic summary |
| `PHASE#_*.md` | Phase planning documents |
| `PHASE#_SESSION_NOTES.md` | Session notes after completion |
| `SESSION_STATUS.md` | Current progress tracking |
| `*_SUMMARY.md` | Summary documents |

---

## Questions?

- **Using the app:** See [User Guide](./user-guide/)
- **Contributing:** See [CONTRIBUTING.md](../CONTRIBUTING.md)
- **Technical questions:** See [Architecture](./architecture/)
- **Learning journey:** See [Learning Materials](./learning/)

---

**Last Updated:** 2026-01-21
