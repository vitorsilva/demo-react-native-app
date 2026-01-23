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

## Architecture Decisions

### Guiding Principle
> **Reuse things that are equal, keep independent things that are different.**

### VPS Constraints
- VPS supports PHP 7.4 + MySQL (no Node.js, no WebSocket)
- Saberloop already has working infrastructure on same VPS
- Proven patterns for telemetry, deployment, security

### Decision Matrix

| Aspect | Concept | Technical Implementation |
|--------|---------|--------------------------|
| **Telemetry** | Same approach | Same infrastructure - all telemetry → Saberloop endpoint |
| **App Data** | Same approach (PHP on VPS) | Independent - `saborspin.com` domain, separate DB |
| **Authentication** | Same approach | Same pattern as Saberloop |
| **Signaling** | Same approach (HTTP polling) | Same pattern - no WebSocket needed |

### Telemetry: Reuse Saberloop's
- **Endpoint:** `https://saberloop.com/telemetry/ingest.php`
- **Reason:** Same collection, same analysis tools, unified view
- **No new infrastructure needed** for telemetry

### App Data: Independent SaborSpin Backend
- **Domain:** `saborspin.com/api/*` (separate from Saberloop)
- **Database:** Separate MySQL database (`saborspin`) on same instance
- **Code:** New `saborspin-api/` folder (independent from Saberloop's php-api)
- **Reason:** App data is different, should be isolated

### Signaling: HTTP Polling (Like Saberloop)
- **No WebSocket** - VPS doesn't support it, and HTTP polling works fine
- **Same pattern as Saberloop's `signal.php`:**
  - `POST /signal` - Send signaling message
  - `GET /signal/{room}/{participant}` - Poll for messages
- **WebRTC establishes P2P** after signaling completes

---

## What We're Setting Up

### 1. Local Development Stack

```
┌─────────────────────────────────────────────────────────────┐
│                    LOCAL DEVELOPMENT                         │
│                                                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐       │
│  │   SaborSpin  │  │   PHP API    │  │    MySQL     │       │
│  │  React Native│  │ (SaborSpin)  │  │  (saborspin) │       │
│  │    :8081     │  │    :8080     │  │    :3306     │       │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘       │
│         │                 │                 │                │
│         └─────────────────┴─────────────────┘                │
│                           │                                  │
│         ┌─────────────────┼─────────────────┐               │
│         │                 │                 │               │
│         ▼                 ▼                 ▼               │
│  ┌────────────┐   ┌────────────┐   ┌────────────┐          │
│  │ Telemetry  │   │ App Data   │   │  Grafana   │          │
│  │ →Saberloop │   │ →localhost │   │   +Loki    │          │
│  │  endpoint  │   │   :8080    │   │   :3000    │          │
│  └────────────┘   └────────────┘   └────────────┘          │
└─────────────────────────────────────────────────────────────┘
```

### 2. VPS Production Stack

```
┌─────────────────────────────────────────────────────────────┐
│                         VPS                                  │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐   │
│  │                    Apache / nginx                      │   │
│  │                                                        │   │
│  │  saberloop.com/*          ──► Saberloop PHP           │   │
│  │  saberloop.com/telemetry  ──► Telemetry (shared)      │   │
│  │                                                        │   │
│  │  saborspin.com/api/*      ──► SaborSpin PHP (NEW)     │   │
│  └──────────────────────────────────────────────────────┘   │
│                           │                                  │
│              ┌────────────▼────────────┐                    │
│              │        MySQL            │                    │
│              │  - saberloop (existing) │                    │
│              │  - saborspin (NEW)      │                    │
│              └─────────────────────────┘                    │
└─────────────────────────────────────────────────────────────┘
```

---

## API Endpoints to Create

**Base URL:** `https://saborspin.com/api`

### Family Management (Phase 4 prep)
| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/families` | POST | Create family |
| `/families/{code}` | GET | Get family by invite code |
| `/families/{id}/join` | POST | Join family |
| `/families/{id}/members` | GET | List members |

### Sync (Phase 6)
| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/sync/{familyId}` | GET | Download family data blob |
| `/sync/{familyId}` | POST | Upload family data blob |
| `/sync/{familyId}/changes` | GET | Get changes since timestamp |

### Signaling - HTTP Polling (Phase 8 - P2P)

**Same pattern as Saberloop** - No WebSocket, uses HTTP polling:

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/signal` | POST | Send signaling message (offer/answer/ICE) |
| `/signal/{familyId}/{odId}` | GET | Poll for incoming messages |
| `/signal/{familyId}/{odId}/peers` | GET | Get other participants |

**How it works:**
1. Client A sends `POST /signal` with offer to Client B
2. Client B polls `GET /signal/{family}/{id}` and receives offer
3. Client B sends `POST /signal` with answer to Client A
4. Both exchange ICE candidates via same endpoints
5. WebRTC connection established directly between clients
6. Server is no longer needed (until reconnect)

### Telemetry (Reuse Saberloop's - No Changes Needed)
| Endpoint | Method | Purpose |
|----------|--------|---------|
| `https://saberloop.com/telemetry/ingest.php` | POST | Shared telemetry endpoint |

**Note:** Telemetry goes to Saberloop, not SaborSpin. Same analysis tools, unified view.

---

## Database Schema (MySQL)

**Database:** `saborspin` (separate from Saberloop's database)

```sql
-- SaborSpin tables (in separate `saborspin` database)

-- User identity (synced from device)
CREATE TABLE users (
  id VARCHAR(36) PRIMARY KEY,           -- UUID from device
  display_name VARCHAR(100),
  public_key TEXT,                       -- For signature verification
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Families
CREATE TABLE families (
  id VARCHAR(36) PRIMARY KEY,            -- UUID
  name VARCHAR(100) NOT NULL,
  invite_code VARCHAR(8) UNIQUE,         -- Short code for joining
  created_by VARCHAR(36),                -- user_id
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (created_by) REFERENCES users(id)
);

-- Family membership
CREATE TABLE family_members (
  family_id VARCHAR(36),
  user_id VARCHAR(36),
  role ENUM('admin', 'member') DEFAULT 'member',
  joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (family_id, user_id),
  FOREIGN KEY (family_id) REFERENCES families(id),
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Sync data (encrypted blobs)
CREATE TABLE sync_data (
  family_id VARCHAR(36) PRIMARY KEY,
  encrypted_blob LONGTEXT,               -- JSON encrypted by family key
  version INT DEFAULT 1,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (family_id) REFERENCES families(id)
);

-- Sync log (for conflict detection)
CREATE TABLE sync_log (
  id INT AUTO_INCREMENT PRIMARY KEY,
  family_id VARCHAR(36),
  user_id VARCHAR(36),
  action ENUM('upload', 'download') NOT NULL,
  version INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (family_id) REFERENCES families(id),
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Signaling messages (for WebRTC setup, like Saberloop)
CREATE TABLE signaling (
  id INT AUTO_INCREMENT PRIMARY KEY,
  family_id VARCHAR(36) NOT NULL,
  from_id VARCHAR(36) NOT NULL,          -- sender participant ID
  to_id VARCHAR(36) NOT NULL,            -- recipient participant ID
  type ENUM('offer', 'answer', 'ice') NOT NULL,
  payload JSON NOT NULL,                  -- WebRTC signaling data
  read_at TIMESTAMP NULL,                 -- when recipient read it
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_recipient (family_id, to_id, read_at)
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

### New Files (in SaborSpin repo: `demo-react-native-app/`)

```
demo-react-native-app/
├── saborspin-api/                  # NEW: Independent PHP API
│   ├── config.php                  # Database config
│   ├── config.local.php            # Local overrides (gitignored)
│   ├── Database.php                # DB connection (copy pattern from Saberloop)
│   ├── ApiHelper.php               # Request/response helpers (copy pattern)
│   ├── endpoints/
│   │   ├── families.php            # Family CRUD
│   │   ├── sync.php                # Sync endpoints
│   │   ├── signal.php              # WebRTC signaling (HTTP polling)
│   │   └── health.php              # Health check
│   ├── managers/
│   │   ├── FamilyManager.php
│   │   ├── SyncManager.php
│   │   └── SignalingManager.php    # Copy pattern from Saberloop
│   ├── migrate.php                 # Database migrations
│   ├── cleanup.php                 # Delete expired signaling messages
│   └── .htaccess                   # Routing rules
├── docker-compose.dev.yml          # Local PHP + MySQL for SaborSpin
├── docker-compose.telemetry.yml    # Grafana + Loki (analysis)
├── docker/
│   ├── php/Dockerfile              # PHP 7.4 Apache (copy from Saberloop)
│   ├── loki-config.yml
│   └── grafana-datasources.yml
├── scripts/
│   └── deploy-api.cjs              # Deploy to VPS via FTP
└── docs/
    └── developer-guide/
        └── SERVER_SETUP.md         # Server development guide
```

### Modified Files

| File | Change |
|------|--------|
| `package.json` | Add docker/deploy scripts |
| `.env.example` | Add API endpoint variables |

---

## Docker Commands

### Start Local Development Stack

```bash
# From SaborSpin repo
cd C:\Users\omeue\source\repos\demo-react-native-app

# Start PHP + MySQL
docker-compose -f docker-compose.dev.yml up -d

# Run migrations
docker-compose -f docker-compose.dev.yml exec php-api php /var/www/html/migrate.php

# View logs
docker-compose -f docker-compose.dev.yml logs -f php-api
```

### Start Telemetry Analysis Stack

```bash
# Grafana + Loki for viewing telemetry data
docker-compose -f docker-compose.telemetry.yml up -d

# Access Grafana: http://localhost:3000 (admin/admin)
```

### Test API Locally

```bash
# Health check
curl http://localhost:8080/endpoints/health.php

# Create family (example)
curl -X POST http://localhost:8080/endpoints/families.php \
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
EXPO_PUBLIC_API_ENDPOINT=https://saborspin.com/api
EXPO_PUBLIC_API_TOKEN=your-api-token

# Telemetry (reuse Saberloop's endpoint - shared infrastructure)
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

1. **Configure VPS for saborspin.com domain:**
   - Point DNS to VPS IP
   - Configure Apache/nginx virtual host for saborspin.com
   - Set up SSL certificate (Let's Encrypt)

2. **Create database on VPS:**
   ```bash
   mysql -u root -p
   CREATE DATABASE saborspin;
   GRANT ALL ON saborspin.* TO 'saborspin_user'@'localhost' IDENTIFIED BY 'password';
   ```

3. **Deploy PHP files:**
   ```bash
   npm run deploy:api
   # Uses FTP to upload saborspin-api/ to VPS
   ```

4. **Run migrations on VPS:**
   ```bash
   ssh user@vps "cd /var/www/saborspin.com/api && php migrate.php"
   ```

5. **Verify deployment:**
   ```bash
   curl https://saborspin.com/api/endpoints/health.php
   ```

### Rollback Plan
- PHP files can be reverted via FTP
- Database tables are additive (no destructive migrations)
- App continues to work offline without API

---

## Success Criteria

Phase 3.5 is complete when:

- [ ] Docker stack runs locally (PHP + MySQL)
- [ ] SaborSpin database tables created (users, families, sync_data, signaling)
- [ ] Family endpoints working (create, get, join)
- [ ] Sync endpoints working (upload, download)
- [ ] Signaling endpoints working (send, poll) - HTTP polling pattern
- [ ] Authentication middleware in place (same pattern as Saberloop)
- [ ] PHPUnit tests passing
- [ ] Deployed to VPS at `saborspin.com/api`
- [ ] React Native app can call health endpoint
- [ ] Telemetry goes to Saberloop endpoint successfully
- [ ] Telemetry analysis stack (Grafana + Loki) available locally
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

## Decisions Made

| Question | Decision | Rationale |
|----------|----------|-----------|
| **Database** | Separate database (`saborspin`) | Different app data should be isolated |
| **API URL** | `saborspin.com/api/*` | Independent domain, cleaner separation |
| **Telemetry** | Reuse Saberloop's endpoint | Same concept, same infrastructure |
| **Authentication** | Same pattern as Saberloop | Proven approach, consistent |
| **Signaling** | HTTP polling (no WebSocket) | VPS doesn't support WebSocket, HTTP works fine |

---

*Phase 3.5: Foundation for Multi-User Features*
