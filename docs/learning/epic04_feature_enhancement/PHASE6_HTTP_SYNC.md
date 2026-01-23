# Phase 6: HTTP Sync

**Status:** 📋 PLANNED

**Goal:** Sync family data across devices via server

**Dependencies:**
- Phase 3.5 (Server Infrastructure) - Server endpoints must be deployed
- Phase 5 (Shared Meal Logs) - Meal data structure with family context

---

## Development Prerequisites

Before starting this phase, ensure:

### 1. Server Infrastructure Ready (from Phase 3.5)
```bash
# Verify Docker stack is running
cd C:\Users\omeue\source\repos\demo-react-native-app
docker-compose -f docker-compose.dev.yml ps

# If not running, start it
docker-compose -f docker-compose.dev.yml up -d

# Verify API is accessible
curl http://localhost:8080/endpoints/health.php
```

### 2. Database Migrations Run
```bash
# Run migrations if not already done
docker-compose -f docker-compose.dev.yml exec php-api php /var/www/html/migrate.php
```

### 3. Environment Variables Set
```bash
# .env should have:
EXPO_PUBLIC_API_ENABLED=true
EXPO_PUBLIC_API_ENDPOINT=http://localhost:8080  # Local dev
# EXPO_PUBLIC_API_ENDPOINT=https://saborspin.com/api  # Production
```

---

## Overview

This phase enables cross-device synchronization:
1. VPS endpoints for family data
2. Encrypted blob storage (server can't read data)
3. Sync on app open (on-demand, not always-on)
4. Conflict resolution
5. Sync status indicator

This makes family sharing actually work across devices.

---

## UI Wireframes: Before & After

### Sync Status Indicator (Header)

**BEFORE:**
```
┌─────────────────────────────────────┐
│  SaborSpin          [🏠 Silva ▼]   │
├─────────────────────────────────────┤
```

**AFTER:**
```
┌─────────────────────────────────────┐
│  SaborSpin    [☁️ ✓]  [🏠 Silva ▼] │  ← Sync indicator
├─────────────────────────────────────┤

Sync States:
┌─────────────────────────────────────┐
│  [☁️ ✓]     = Synced (all good)    │
│  [☁️ 🔄]    = Syncing...            │
│  [☁️ 3]     = 3 changes pending     │
│  [☁️ ⚠️]    = Offline               │
│  [☁️ ❌]    = Sync error            │
└─────────────────────────────────────┘
```

### Sync Status Detail (Tap on indicator)

**NEW BOTTOM SHEET:**
```
┌─────────────────────────────────────┐
│  Sync Status                    [X] │
├─────────────────────────────────────┤
│                                     │
│  ☁️ Last synced: 2 minutes ago      │
│                                     │
│  Silva Household:                   │
│  ┌─────────────────────────────────┐│
│  │ ✓ Up to date                    ││
│  │   4 members synced              ││
│  └─────────────────────────────────┘│
│                                     │
│  Extended Family:                   │
│  ┌─────────────────────────────────┐│
│  │ ⚠️ 2 changes pending            ││
│  │   Waiting for connection        ││
│  └─────────────────────────────────┘│
│                                     │
│  ┌─────────────────────────────────┐│
│  │         [Sync Now]              ││
│  └─────────────────────────────────┘│
│                                     │
└─────────────────────────────────────┘
```

### Settings - Sync Options

**NEW in Settings:**
```
┌─────────────────────────────────────┐
│  Settings                           │
├─────────────────────────────────────┤
│                                     │
│  Sync                               │  ← NEW section
│  ┌─────────────────────────────────┐│
│  │ Auto-sync on app open   [====○]││
│  │                                 ││
│  │ Last sync: 2 min ago            ││
│  │ Pending changes: 0              ││
│  │                                 ││
│  │ [Sync Now]                      ││
│  └─────────────────────────────────┘│
│                                     │
│  ...                                │
└─────────────────────────────────────┘
```

### Family History (After Sync)

**Shows meals from all family devices:**
```
┌─────────────────────────────────────┐
│  History                            │
├─────────────────────────────────────┤
│  [My Meals] [🏠 Family] [⭐ Favs]   │
├─────────────────────────────────────┤
│                                     │
│  Today in Silva Household           │
│                                     │
│  ┌─────────────────────────────────┐│
│  │ 👤 João (this device)           ││  ← Local
│  │ milk + cereals                  ││
│  │ Breakfast • 8:30 AM             ││
│  └─────────────────────────────────┘│
│  ┌─────────────────────────────────┐│
│  │ 👤 Maria                   [☁️] ││  ← Synced from Maria's device
│  │ yogurt + bread + jam            ││
│  │ Breakfast • 9:00 AM             ││
│  └─────────────────────────────────┘│
│  ┌─────────────────────────────────┐│
│  │ 👤 Pedro                   [☁️] ││  ← Synced from Pedro's device
│  │ apple + cookies                 ││
│  │ Snack • 10:30 AM                ││
│  └─────────────────────────────────┘│
│                                     │
└─────────────────────────────────────┘
```

---

## Architecture

```
┌─────────────┐         ┌─────────────┐
│  Device A   │         │  Device B   │
│   (João)    │         │   (Maria)   │
└──────┬──────┘         └──────┬──────┘
       │                       │
       │    ┌─────────────┐    │
       └────►   VPS API   ◄────┘
            │             │
            │ Encrypted   │
            │   Blobs     │
            └─────────────┘
```

**Key Principles:**
- **On-demand sync:** Sync when app opens or user requests
- **Encrypted blobs:** Server stores encrypted data it cannot read
- **Last-write-wins:** Simple conflict resolution for MVP
- **Offline-first:** App works without network, syncs when available

---

## Server API

### Endpoints

| Method | Endpoint | Purpose |
|--------|----------|---------|
| `POST` | `/families/register` | Register family for sync |
| `GET` | `/families/{code}` | Look up family by invite code |
| `POST` | `/sync/{familyId}/push` | Upload encrypted data |
| `GET` | `/sync/{familyId}/pull` | Download encrypted data |
| `GET` | `/sync/{familyId}/status` | Check if updates available |

### Data Structures

**Family Registration:**

```typescript
// POST /families/register
interface RegisterFamilyRequest {
  familyId: string;
  inviteCode: string;
  adminPublicKey: string;  // For verification
  createdAt: string;
}

interface RegisterFamilyResponse {
  success: boolean;
  familyId: string;
}
```

**Sync Push:**

```typescript
// POST /sync/{familyId}/push
interface SyncPushRequest {
  familyId: string;
  userId: string;
  encryptedPayload: string;  // Base64 encrypted JSON
  signature: string;          // Signed by user
  timestamp: string;
  version: number;            // Incremental version
}

interface SyncPushResponse {
  success: boolean;
  serverVersion: number;
  conflicts?: boolean;  // True if server has newer data
}
```

**Sync Pull:**

```typescript
// GET /sync/{familyId}/pull?since={version}
interface SyncPullResponse {
  familyId: string;
  currentVersion: number;
  payloads: {
    userId: string;
    encryptedPayload: string;
    signature: string;
    timestamp: string;
    version: number;
  }[];
}
```

---

## Encryption Strategy

**Family Encryption Key:**

```typescript
// Generated when family is created
// Shared with members via secure channel (e.g., in invite payload)
async function generateFamilyKey(): Promise<string> {
  const key = await Crypto.getRandomBytesAsync(32);
  return base64Encode(key);
}

// Encrypt data for sync
async function encryptForSync(data: object, familyKey: string): Promise<string> {
  const json = JSON.stringify(data);
  const encrypted = await encrypt(json, familyKey);  // AES-256-GCM
  return base64Encode(encrypted);
}

// Decrypt data from sync
async function decryptFromSync(encrypted: string, familyKey: string): Promise<object> {
  const data = base64Decode(encrypted);
  const decrypted = await decrypt(data, familyKey);
  return JSON.parse(decrypted);
}
```

**Key Distribution:**
- Family key embedded in invite (QR code, deep link)
- Key stored encrypted on device
- Server never sees unencrypted key

---

## Sync Logic

### On App Open

```typescript
async function syncOnAppOpen(): Promise<void> {
  const families = await getMyFamilies();

  for (const family of families) {
    await syncFamily(family.id);
  }
}

async function syncFamily(familyId: string): Promise<SyncResult> {
  const family = await getFamily(familyId);
  const localVersion = await getLocalSyncVersion(familyId);

  // 1. Check if server has updates
  const status = await api.get(`/sync/${familyId}/status`);

  if (status.serverVersion > localVersion) {
    // 2. Pull and merge
    await pullAndMerge(familyId, localVersion);
  }

  // 3. Push local changes
  await pushLocalChanges(familyId);

  // 4. Update local version
  await setLocalSyncVersion(familyId, status.serverVersion + 1);

  return { success: true };
}
```

### Pull and Merge

```typescript
async function pullAndMerge(familyId: string, sinceVersion: number): Promise<void> {
  const response = await api.get(`/sync/${familyId}/pull?since=${sinceVersion}`);
  const familyKey = await getFamilyKey(familyId);

  for (const payload of response.payloads) {
    // Verify signature
    const isValid = await verifySignature(
      payload.encryptedPayload,
      payload.signature,
      payload.userId
    );

    if (!isValid) {
      console.warn('Invalid signature, skipping payload');
      continue;
    }

    // Decrypt
    const data = await decryptFromSync(payload.encryptedPayload, familyKey);

    // Merge into local database
    await mergeIntoLocal(data, payload.timestamp);
  }
}
```

### Push Local Changes

```typescript
async function pushLocalChanges(familyId: string): Promise<void> {
  const user = await getCurrentUser();
  const familyKey = await getFamilyKey(familyId);
  const lastPush = await getLastPushTimestamp(familyId);

  // Get changes since last push
  const changes = await getChangesSince(familyId, lastPush);

  if (changes.length === 0) return;

  // Build payload
  const payload = {
    mealLogs: changes.filter(c => c.type === 'meal_log'),
    ingredients: changes.filter(c => c.type === 'ingredient'),
    // ... other entity types
  };

  // Encrypt
  const encryptedPayload = await encryptForSync(payload, familyKey);

  // Sign
  const signature = await signData(encryptedPayload, user.privateKey);

  // Push
  await api.post(`/sync/${familyId}/push`, {
    familyId,
    userId: user.id,
    encryptedPayload,
    signature,
    timestamp: new Date().toISOString(),
    version: await getLocalSyncVersion(familyId) + 1,
  });

  await setLastPushTimestamp(familyId, new Date().toISOString());
}
```

---

## Conflict Resolution

**Strategy: Last-Write-Wins (LWW)**

For MVP, use simple timestamp-based resolution:

```typescript
async function mergeIntoLocal(data: SyncPayload, remoteTimestamp: string): Promise<void> {
  for (const mealLog of data.mealLogs) {
    const local = await db.query('SELECT * FROM meal_logs WHERE id = ?', [mealLog.id]);

    if (!local) {
      // New record, insert
      await db.insert('meal_logs', mealLog);
    } else if (new Date(mealLog.updatedAt) > new Date(local.updatedAt)) {
      // Remote is newer, update
      await db.update('meal_logs', mealLog, { id: mealLog.id });
    }
    // else: local is newer, keep local
  }
}
```

**Future Enhancement:** Conflict UI for manual resolution when needed.

---

## Sync Status Indicator

**UI Component:**

```
┌─────────────────────────────────────┐
│  ☁️ Synced                    ✓     │  ← All synced
│  ☁️ Syncing...               🔄     │  ← In progress
│  ☁️ Offline (3 changes pending) ⚠️  │  ← Offline with pending
│  ☁️ Sync failed              ❌     │  ← Error state
└─────────────────────────────────────┘
```

**Store State:**

```typescript
interface SyncState {
  status: 'idle' | 'syncing' | 'error' | 'offline';
  lastSyncAt: string | null;
  pendingChanges: number;
  error: string | null;
}
```

---

## Change Tracking

**Track changes for sync:**

```sql
CREATE TABLE sync_queue (
  id TEXT PRIMARY KEY,
  family_id TEXT NOT NULL,
  entity_type TEXT NOT NULL,  -- 'meal_log', 'ingredient', etc.
  entity_id TEXT NOT NULL,
  action TEXT NOT NULL,        -- 'create', 'update', 'delete'
  payload TEXT NOT NULL,       -- JSON of entity
  created_at TEXT NOT NULL,
  synced_at TEXT              -- NULL until synced
);
```

**On local changes:**

```typescript
async function trackChange(
  familyId: string,
  entityType: string,
  entityId: string,
  action: 'create' | 'update' | 'delete',
  payload: object
): Promise<void> {
  await db.insert('sync_queue', {
    id: Crypto.randomUUID(),
    familyId,
    entityType,
    entityId,
    action,
    payload: JSON.stringify(payload),
    createdAt: new Date().toISOString(),
    syncedAt: null,
  });
}
```

---

## Server Implementation Notes

**Tech Stack Options:**
- Node.js + Express + SQLite/PostgreSQL
- Deno + Oak
- Go + Chi
- (Reuse existing VPS from telemetry)

**Storage:**
- Encrypted blobs stored as-is
- Indexed by familyId and version
- Old versions can be pruned after N days

**Security:**
- Rate limiting
- Family-level access tokens (optional)
- HTTPS only

---

## Implementation Order

| Order | Task | Effort | Notes |
|-------|------|--------|-------|
| 1 | Run existing test suites | ~15 min | Baseline: unit, Playwright E2E, Maestro |
| 2 | Run quality baseline | ~30 min | test:mutation, arch:test, lint:dead-code, lint:duplicates, security:scan |
| 3 | Design server API spec | ~2 hours | OpenAPI/docs |
| 4 | Implement server endpoints | ~8 hours | Backend work |
| 5 | Write unit tests for server endpoints | ~3 hours | Test API responses, validation |
| 6 | Add encryption utilities | ~4 hours | Client crypto |
| 7 | Write unit tests for encryption | ~1.5 hours | Test encrypt/decrypt roundtrip |
| 8 | Add sync_queue table | ~1 hour | Migration |
| 9 | Write unit tests for sync_queue migration | ~30 min | Test table creation |
| 10 | Implement change tracking | ~3 hours | Store hooks |
| 11 | Write unit tests for `trackChange()` | ~1 hour | Test change capture logic |
| 12 | Implement sync pull logic | ~4 hours | Client |
| 13 | Write unit tests for pull + merge | ~1.5 hours | Test merge logic (LWW) |
| 14 | Implement sync push logic | ~4 hours | Client |
| 15 | Write unit tests for push logic | ~1 hour | Test payload creation, signature |
| 16 | Add sync-on-app-open | ~2 hours | App lifecycle |
| 17 | Add manual sync trigger | ~1 hour | UI button |
| 18 | Add sync status indicator | ~3 hours | Component |
| 19 | Write Playwright E2E test for manual sync | ~1.5 hours | Test sync button, status indicator |
| 20 | Write Maestro test for manual sync | ~1.5 hours | Mirror Playwright test for mobile |
| 21 | Write Playwright E2E test for sync status | ~1 hour | Test pending changes, last sync time |
| 22 | Write Maestro test for sync status | ~1 hour | Mirror Playwright test for mobile |
| 23 | Run full test suites | ~20 min | Unit + Playwright + Maestro, verify no regressions |
| 24 | Run quality checks and compare | ~30 min | Compare to baseline; create remediation plan if worse |
| 25 | Integration testing with 2+ devices | ~4 hours | Real device sync verification |
| 26 | Document learning notes | ~30 min | Capture unexpected errors, workarounds, fixes |

**Total Estimated Effort:** ~52.5 hours (including unit + Playwright + Maestro tests + quality checks)

---

## Testing Strategy

### Local Development Testing (with Docker)
```bash
# 1. Start the local PHP + MySQL stack
docker-compose -f docker-compose.dev.yml up -d

# 2. Run React Native app pointing to local server
# .env: EXPO_PUBLIC_API_ENDPOINT=http://localhost:8080
npm start

# 3. Test sync manually:
#    - Create family on one device/emulator
#    - Join on another
#    - Log meal, trigger sync
#    - Verify data appears on both

# 4. View server logs
docker-compose -f docker-compose.dev.yml logs -f php-api
```

### Unit Tests
- [ ] Encryption/decryption roundtrip
- [ ] Signature generation/verification
- [ ] Merge logic (LWW)
- [ ] Change tracking captures all changes

### Integration Tests (require Docker running)
- [ ] Push syncs to server
- [ ] Pull retrieves from server
- [ ] Two devices see same data after sync
- [ ] Offline changes sync when back online

### E2E Tests
- [ ] Create family on device A, join on device B
- [ ] Log meal on A, sync, see on B
- [ ] Offline logging syncs when online

---

## Deployment Strategy

### Release Type
**Coordinated Release** - Server + client deployment required

### Deployment Order
1. **Deploy server endpoints first** (backward compatible)
2. **Deploy client update** (connects to new endpoints)
3. **Monitor sync success rates**

### Server Deployment
```bash
# Deploy PHP files to VPS via FTP
npm run deploy:api

# On VPS (SSH)
ssh user@vps

# Run migrations
cd /var/www/saborspin.com/api
php migrate.php

# Verify endpoints
curl https://saborspin.com/api/endpoints/health.php
curl https://saborspin.com/api/endpoints/sync.php
```

### Pre-Deployment Checklist
- [ ] Server endpoints deployed and tested
- [ ] All unit tests passing
- [ ] All E2E tests passing (Playwright + Maestro)
- [ ] Sync tested across multiple devices
- [ ] Offline → online sync tested
- [ ] Quality baseline comparison completed
- [ ] Version bump in `app.json`

### Client Build & Release
```bash
# 1. Bump version (minor - networking feature)
npm version minor

# 2. Build preview APK
eas build --platform android --profile preview

# 3. Test scenarios:
#    - Fresh sync (no prior data)
#    - Incremental sync
#    - Offline logging → sync when online
#    - Conflict resolution

# 4. Build production release
eas build --platform android --profile production

# 5. Staged rollout (10% → 50% → 100%)
```

### Rollback Plan
- **Client:** Revert APK, app works offline without sync
- **Server:** Endpoints can be disabled, client falls back to local-only
- Sync data preserved on server, can resume after fix

### Post-Deployment
- Monitor sync success/failure rates
- Track sync latency
- Check OTel error spans for network errors
- Monitor server load

---

## Files to Create/Modify

**New Files (Server):**
- `server/index.ts` - Server entry point
- `server/routes/families.ts` - Family endpoints
- `server/routes/sync.ts` - Sync endpoints
- `server/db/schema.sql` - Server database

**New Files (Client):**
- `lib/sync/syncManager.ts` - Sync orchestration
- `lib/sync/encryption.ts` - Encryption utilities
- `lib/sync/changeTracker.ts` - Change tracking
- `lib/sync/api.ts` - Server API client
- `components/SyncStatusIndicator.tsx` - Status UI
- `docs/learning/epic04_feature_enhancement/PHASE6_LEARNING_NOTES.md` - Learning notes

**Modified Files:**
- `lib/database/migrations.ts` - sync_queue table
- `lib/store/index.ts` - Sync state, hooks for tracking
- `app/_layout.tsx` - Sync on app open
- `app/(tabs)/settings.tsx` - Manual sync button

---

## Success Criteria

Phase 6 is complete when:
- [ ] Server endpoints deployed and working
- [ ] Family data syncs between devices
- [ ] Encryption protects data from server
- [ ] Sync status visible to user
- [ ] Offline changes sync when online
- [ ] All tests pass

---

## Learning Notes

Document unexpected errors, workarounds, and fixes encountered during implementation:

**[Phase 6 Learning Notes →](./PHASE6_LEARNING_NOTES.md)**

---

## Reference

See [Approach 2: Family Kitchen - Section 2.4](../../product_info/meals-randomizer-exploration.md#24-technical-architecture-pear-lite-hybrid) for architecture design.

### Developer Guides

- [Testing Guide](../../developer-guide/TESTING.md) - Unit testing patterns
- [Maestro Testing](../../developer-guide/MAESTRO_TESTING.md) - Mobile E2E testing
- [Architecture Rules](../../developer-guide/ARCHITECTURE_RULES.md) - Architecture testing
- [Telemetry Guide](../../developer-guide/TELEMETRY.md) - Sync observability
- [Troubleshooting](../../developer-guide/TROUBLESHOOTING.md) - Network issues
- [Database Schema](../../architecture/DATABASE_SCHEMA.md) - Sync tracking schema
- [State Management](../../architecture/STATE_MANAGEMENT.md) - Sync state patterns
