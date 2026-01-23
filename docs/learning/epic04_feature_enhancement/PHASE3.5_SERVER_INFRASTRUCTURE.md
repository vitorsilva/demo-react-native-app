# Phase 3.5: Server Infrastructure

**Status:** 📋 PLANNING
**Dependencies:** None (can run in parallel with Phases 1-3)
**Blocks:** Phase 6 (HTTP Sync), Phase 7 (Proposals), Phase 8 (P2P Sync)

---

## Overview

Set up the server-side infrastructure needed for family sharing features. This phase establishes:
1. Local Docker development environment
2. PHP API structure (following Saberloop patterns)
3. VPS deployment pipeline
4. Telemetry analysis tools

**Why Before Phase 4?**
- Phase 4 (User Identity) is local-only but benefits from API structure planning
- Phase 5 (Shared Meals) needs API design decisions made
- Phase 6 (HTTP Sync) requires working server infrastructure
- Better to set up infrastructure early and iterate

---

## Architecture Decision: Reuse Saberloop Infrastructure

### VPS Constraints
- VPS supports PHP 7.4 + MySQL (no Node.js)
- Saberloop already has working infrastructure on same VPS
- Proven patterns for telemetry, deployment, security

### Approach: Extend Saberloop's Backend

| Option | Description | Recommendation |
|--------|-------------|----------------|
| **A: Shared Endpoints** | Add SaborSpin routes to existing `php-api/` | ✅ Recommended |
| B: Separate PHP Project | New `saborspin-api/` folder | More isolation but duplication |
| C: Subdomain | `api.saborspin.com` pointing to separate folder | Clean but more VPS config |

**Recommendation: Option A** - Add SaborSpin endpoints to Saberloop's `php-api/` folder:
- Reuse existing database connection, auth patterns, deployment scripts
- Share MySQL instance (separate database or tables)
- Unified telemetry collection
- Single Docker setup for local development

---

## What We're Setting Up

### 1. Local Development Stack

```
┌─────────────────────────────────────────────────────────────┐
│                    LOCAL DEVELOPMENT                         │
│                                                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐       │
│  │   SaborSpin  │  │   PHP API    │  │    MySQL     │       │
│  │  React Native│  │  (shared w/  │  │   (shared)   │       │
│  │    :8081     │  │  Saberloop)  │  │    :3306     │       │
│  │              │  │    :8080     │  │              │       │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘       │
│         │                 │                 │                │
│         └─────────────────┴─────────────────┘                │
│                           │                                  │
│              ┌────────────▼────────────┐                    │
│              │   Grafana + Loki        │                    │
│              │   (Telemetry Analysis)  │                    │
│              │   :3000 / :3100         │                    │
│              └─────────────────────────┘                    │
└─────────────────────────────────────────────────────────────┘
```

### 2. VPS Production Stack

```
┌─────────────────────────────────────────────────────────────┐
│                         VPS                                  │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐   │
│  │                    Apache / nginx                      │   │
│  │  saberloop.com/* ──► Saberloop PHP                    │   │
│  │  saberloop.com/saborspin/* ──► SaborSpin PHP          │   │
│  │        (or saborspin.com/api/*)                       │   │
│  └──────────────────────────────────────────────────────┘   │
│                           │                                  │
│              ┌────────────▼────────────┐                    │
│              │        MySQL            │                    │
│              │  - saberloop (existing) │                    │
│              │  - saborspin (new)      │                    │
│              └─────────────────────────┘                    │
└─────────────────────────────────────────────────────────────┘
```

---

## API Endpoints to Create

### Family Management (Phase 4 prep)
| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/saborspin/families` | POST | Create family |
| `/saborspin/families/{code}` | GET | Get family by invite code |
| `/saborspin/families/{id}/join` | POST | Join family |
| `/saborspin/families/{id}/members` | GET | List members |

### Sync (Phase 6)
| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/saborspin/sync/{familyId}` | GET | Download family data blob |
| `/saborspin/sync/{familyId}` | POST | Upload family data blob |
| `/saborspin/sync/{familyId}/changes` | GET | Get changes since timestamp |

### Signaling (Phase 8 - P2P)
| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/saborspin/signal` | WebSocket | WebRTC signaling |

### Telemetry (Reuse Saberloop's)
| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/telemetry/ingest.php` | POST | Already exists in Saberloop |

---

## Database Schema (MySQL)

```sql
-- SaborSpin tables (in shared MySQL, separate database or prefixed tables)

-- User identity (synced from device)
CREATE TABLE saborspin_users (
  id VARCHAR(36) PRIMARY KEY,           -- UUID from device
  display_name VARCHAR(100),
  public_key TEXT,                       -- For signature verification
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Families
CREATE TABLE saborspin_families (
  id VARCHAR(36) PRIMARY KEY,            -- UUID
  name VARCHAR(100) NOT NULL,
  invite_code VARCHAR(8) UNIQUE,         -- Short code for joining
  created_by VARCHAR(36),                -- user_id
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (created_by) REFERENCES saborspin_users(id)
);

-- Family membership
CREATE TABLE saborspin_family_members (
  family_id VARCHAR(36),
  user_id VARCHAR(36),
  role ENUM('admin', 'member') DEFAULT 'member',
  joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (family_id, user_id),
  FOREIGN KEY (family_id) REFERENCES saborspin_families(id),
  FOREIGN KEY (user_id) REFERENCES saborspin_users(id)
);

-- Sync data (encrypted blobs)
CREATE TABLE saborspin_sync_data (
  family_id VARCHAR(36) PRIMARY KEY,
  encrypted_blob LONGTEXT,               -- JSON encrypted by family key
  version INT DEFAULT 1,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (family_id) REFERENCES saborspin_families(id)
);

-- Sync log (for conflict detection)
CREATE TABLE saborspin_sync_log (
  id INT AUTO_INCREMENT PRIMARY KEY,
  family_id VARCHAR(36),
  user_id VARCHAR(36),
  action ENUM('upload', 'download') NOT NULL,
  version INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (family_id) REFERENCES saborspin_families(id),
  FOREIGN KEY (user_id) REFERENCES saborspin_users(id)
);
```

---

## Implementation Order

| # | Task | Effort | Notes |
|---|------|--------|-------|
| 1 | Run existing test suites | ~15 min | Baseline validation |
| 2 | Run quality baseline | ~30 min | test:mutation, arch:test, lint:dead-code, lint:duplicates, security:scan |
| 3 | Set up local Docker environment | ~2 hours | Copy/adapt from Saberloop |
| 4 | Create SaborSpin database schema | ~1 hour | MySQL tables |
| 5 | Create PHP folder structure | ~1 hour | `/saborspin/` in php-api |
| 6 | Implement family endpoints (stub) | ~2 hours | Basic CRUD, no logic |
| 7 | Implement sync endpoints (stub) | ~1 hour | Upload/download blob |
| 8 | Add authentication middleware | ~2 hours | Token-based, reuse Saberloop pattern |
| 9 | Write unit tests (PHP) | ~2 hours | PHPUnit tests |
| 10 | Create deployment script | ~1 hour | Adapt Saberloop's FTP deploy |
| 11 | Deploy to VPS | ~1 hour | Create database, deploy PHP |
| 12 | Test from React Native app | ~1 hour | Verify connectivity |
| 13 | Set up telemetry analysis stack | ~1 hour | Grafana + Loki locally |
| 14 | Update documentation | ~30 min | Developer guide |
| 15 | Run quality checks and compare | ~30 min | Compare to baseline |
| 16 | Document learning notes | ~30 min | Capture issues/fixes |

**Total Estimated Effort:** ~16.5 hours

---

## Files to Create/Modify

### New Files (in Saberloop repo: `demo-pwa-app/`)

```
php-api/
├── saborspin/                      # NEW: SaborSpin API
│   ├── config.php                  # Database config
│   ├── Database.php                # DB connection (or reuse existing)
│   ├── endpoints/
│   │   ├── families.php            # Family CRUD
│   │   ├── sync.php                # Sync endpoints
│   │   └── health.php              # Health check
│   ├── models/
│   │   ├── Family.php
│   │   ├── User.php
│   │   └── SyncData.php
│   ├── middleware/
│   │   └── auth.php                # Token verification
│   ├── migrate.php                 # Database migrations
│   └── .htaccess                   # Routing rules
```

### New Files (in SaborSpin repo: `demo-react-native-app/`)

```
demo-react-native-app/
├── docker-compose.dev.yml          # Local PHP + MySQL
├── docker-compose.telemetry.yml    # Grafana + Loki
├── docker/
│   ├── loki-config.yml
│   └── grafana-datasources.yml
├── scripts/
│   └── deploy-api.cjs              # Deploy to VPS (or reuse Saberloop's)
└── docs/
    └── developer-guide/
        └── SERVER_SETUP.md         # Server development guide
```

### Modified Files

| File | Change |
|------|--------|
| `demo-react-native-app/package.json` | Add docker/deploy scripts |
| `demo-react-native-app/.env.example` | Add API endpoint variables |
| `demo-pwa-app/docker-compose.php.yml` | Verify SaborSpin compatibility |

---

## Docker Commands

### Start Local Development Stack

```bash
# From Saberloop repo (shares PHP + MySQL)
cd C:\Users\omeue\source\repos\demo-pwa-app
docker-compose -f docker-compose.php.yml up -d php-api mysql

# Run SaborSpin migrations
docker-compose -f docker-compose.php.yml exec php-api php /var/www/html/saborspin/migrate.php

# View logs
docker-compose -f docker-compose.php.yml logs -f php-api
```

### Start Telemetry Analysis Stack

```bash
# From SaborSpin repo (or Saberloop - same stack)
docker-compose -f docker-compose.telemetry.yml up -d

# Access Grafana: http://localhost:3000 (admin/admin)
```

### Test API Locally

```bash
# Health check
curl http://localhost:8080/saborspin/endpoints/health.php

# Create family (example)
curl -X POST http://localhost:8080/saborspin/endpoints/families.php \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{"name": "Silva Family", "userId": "uuid-here"}'
```

---

## Environment Variables

### SaborSpin App (`.env`)

```bash
# API Configuration (Phase 3.5)
EXPO_PUBLIC_API_ENABLED=false           # Enable when ready
EXPO_PUBLIC_API_ENDPOINT=https://saberloop.com/saborspin
EXPO_PUBLIC_API_TOKEN=your-api-token

# Telemetry (reuse Saberloop's endpoint)
EXPO_PUBLIC_TELEMETRY_ENABLED=true
EXPO_PUBLIC_TELEMETRY_ENDPOINT=https://saberloop.com/telemetry/ingest.php
```

---

## Testing Strategy

### PHP Unit Tests
- [ ] Family CRUD operations
- [ ] Sync upload/download
- [ ] Authentication middleware
- [ ] Input validation

### Integration Tests
- [ ] React Native → PHP API connectivity
- [ ] Database operations
- [ ] Token authentication flow

### Manual Testing
- [ ] Create family via API
- [ ] Join family via invite code
- [ ] Upload/download sync blob

---

## Deployment Strategy

### Release Type
**Infrastructure Setup** - Server-side only, no app store release needed

### Deployment Steps

1. **Create database on VPS:**
   ```bash
   mysql -u root -p
   CREATE DATABASE saborspin;
   GRANT ALL ON saborspin.* TO 'saberloop'@'localhost';
   ```

2. **Deploy PHP files:**
   ```bash
   npm run deploy:saborspin-api
   # Uses FTP to upload php-api/saborspin/ to VPS
   ```

3. **Run migrations on VPS:**
   ```bash
   ssh user@vps "cd /var/www/html/saborspin && php migrate.php"
   ```

4. **Verify deployment:**
   ```bash
   curl https://saberloop.com/saborspin/endpoints/health.php
   ```

### Rollback Plan
- PHP files can be reverted via FTP
- Database tables are additive (no destructive migrations)
- App continues to work offline without API

---

## Success Criteria

Phase 3.5 is complete when:

- [ ] Docker stack runs locally (PHP + MySQL)
- [ ] SaborSpin database tables created
- [ ] Family endpoints working (create, get, join)
- [ ] Sync endpoints working (upload, download)
- [ ] Authentication middleware in place
- [ ] PHPUnit tests passing
- [ ] Deployed to VPS and accessible
- [ ] React Native app can call health endpoint
- [ ] Telemetry analysis stack available locally
- [ ] Documentation updated

---

## Learning Notes

Document unexpected errors, workarounds, and fixes encountered during implementation:

**[Phase 3.5 Learning Notes →](./PHASE3.5_LEARNING_NOTES.md)**

---

## Reference

### Saberloop Patterns to Reuse
- `php-api/party/Database.php` - Database connection class
- `php-api/party/config.local.php` - Local config pattern
- `php-api/telemetry/ingest.php` - Telemetry endpoint
- `docker-compose.php.yml` - Docker stack
- `scripts/deploy-telemetry.cjs` - FTP deployment

### Developer Guides
- [Saberloop CLAUDE.md](../../../demo-pwa-app/CLAUDE.md) - Docker Development section
- [Telemetry Guide](../../developer-guide/TELEMETRY.md) - OTel patterns
- [Testing Guide](../../developer-guide/TESTING.md) - Test patterns

---

## Questions for Validation

Before starting implementation, please confirm:

1. **Shared vs Separate Database?**
   - Option A: Same MySQL database as Saberloop (tables prefixed with `saborspin_`)
   - Option B: Separate database (`saborspin`) on same MySQL instance
   - **Recommendation:** Option B (cleaner separation, easier backup/restore)

2. **API URL Structure?**
   - Option A: `saberloop.com/saborspin/*` (subfolder of existing domain)
   - Option B: `saborspin.com/api/*` (requires VPS config for new domain)
   - **Recommendation:** Option A initially, can migrate later

3. **Authentication Approach?**
   - Option A: Simple token (like Saberloop telemetry)
   - Option B: JWT with expiry
   - Option C: Device-based key pairs (more complex)
   - **Recommendation:** Start with Option A, evolve to B/C as needed

4. **Should this phase include WebSocket signaling setup?**
   - Could defer to Phase 8 (P2P Sync)
   - **Recommendation:** Defer - HTTP endpoints are enough for now

---

*Phase 3.5: Foundation for Multi-User Features*
