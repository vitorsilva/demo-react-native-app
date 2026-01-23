# Phase 4: User Identity & Families

**Status:** 📋 PLANNED

**Goal:** Foundation for family sharing - local identity and family management

**Dependencies:** None

---

## Overview

This phase establishes the foundation for family sharing (Approach 2: Family Kitchen):
1. Create local user identity on device
2. Enable family creation with invite codes
3. Support family joining via QR/link/code
4. Basic family management UI

No sync in this phase - that comes in Phase 6.

---

## UI Wireframes: Before & After

### First Launch / Onboarding (NEW)

**NEW SCREEN (shown on first app launch):**
```
┌─────────────────────────────────────┐
│                                     │
│           🍳 SaborSpin              │
│                                     │
│       Welcome! Let's set up         │
│         your profile.               │
│                                     │
│  What should we call you?           │
│  ┌─────────────────────────────────┐│
│  │ João                            ││
│  └─────────────────────────────────┘│
│                                     │
│  (This name will be shown to        │
│   family members you share with)    │
│                                     │
│  ┌─────────────────────────────────┐│
│  │         Get Started             ││
│  └─────────────────────────────────┘│
│                                     │
└─────────────────────────────────────┘
```

### Settings Screen (with Families)

**BEFORE:**
```
┌─────────────────────────────────────┐
│  Settings                           │
├─────────────────────────────────────┤
│                                     │
│  Meal Settings                      │
│  ├─ Cooldown period: 3 days         │
│  └─ Suggestions count: 4            │
│                                     │
│  Data                               │
│  ├─ Manage Ingredients              │
│  ├─ Manage Categories               │
│  └─ Manage Meal Types               │
│                                     │
└─────────────────────────────────────┘
```

**AFTER:**
```
┌─────────────────────────────────────┐
│  Settings                           │
├─────────────────────────────────────┤
│                                     │
│  Profile                            │  ← NEW section
│  ┌─────────────────────────────────┐│
│  │ 👤 João                     [→] ││
│  │    Tap to edit name             ││
│  └─────────────────────────────────┘│
│                                     │
│  Families                           │  ← NEW section
│  ┌─────────────────────────────────┐│
│  │ 🏠 Silva Household (Admin)  [→] ││
│  │ 👨‍👩‍👧 Extended Family        [→] ││
│  └─────────────────────────────────┘│
│  [+ Create Family] [Join Family]    │
│                                     │
│  Meal Settings                      │
│  ...                                │
│                                     │
└─────────────────────────────────────┘
```

### Family List Screen (NEW)

**NEW SCREEN (from Settings → Families):**
```
┌─────────────────────────────────────┐
│  ← My Families                      │
├─────────────────────────────────────┤
│                                     │
│  Current: Silva Household       [✓] │  ← Active family
│                                     │
│  ┌─────────────────────────────────┐│
│  │ 🏠 Silva Household              ││
│  │    Admin • 4 members            ││
│  │                            [→]  ││
│  └─────────────────────────────────┘│
│                                     │
│  ┌─────────────────────────────────┐│
│  │ 👨‍👩‍👧 Extended Family              ││
│  │    Member • 8 members           ││
│  │                            [→]  ││
│  └─────────────────────────────────┘│
│                                     │
│  ─────────────────────────────────  │
│                                     │
│  ┌─────────────────────────────────┐│
│  │      [+ Create Family]          ││
│  └─────────────────────────────────┘│
│  ┌─────────────────────────────────┐│
│  │       [Join Family]             ││
│  └─────────────────────────────────┘│
│                                     │
└─────────────────────────────────────┘
```

### Create Family Flow (NEW)

**NEW SCREEN:**
```
┌─────────────────────────────────────┐
│  ← Create Family                    │
├─────────────────────────────────────┤
│                                     │
│  Family Name:                       │
│  ┌─────────────────────────────────┐│
│  │ Silva Household                 ││
│  └─────────────────────────────────┘│
│                                     │
│  You will be the admin of this      │
│  family and can invite others.      │
│                                     │
│  ┌─────────────────────────────────┐│
│  │       Create Family             ││
│  └─────────────────────────────────┘│
│                                     │
└─────────────────────────────────────┘
```

**After creation → Invite Screen:**
```
┌─────────────────────────────────────┐
│  ← Silva Household                  │
├─────────────────────────────────────┤
│                                     │
│  ✓ Family Created!                  │
│                                     │
│  Invite others to join:             │
│                                     │
│  ┌─────────────────────────────────┐│
│  │                                 ││
│  │         [QR CODE]               ││
│  │                                 ││
│  │     Scan to join family         ││
│  └─────────────────────────────────┘│
│                                     │
│  Or share this code:                │
│  ┌─────────────────────────────────┐│
│  │      ABC123           [Copy]    ││
│  └─────────────────────────────────┘│
│                                     │
│  ┌─────────────────────────────────┐│
│  │      [Share Invite Link]        ││
│  └─────────────────────────────────┘│
│                                     │
│  [Done]                             │
│                                     │
└─────────────────────────────────────┘
```

### Join Family Flow (NEW)

**NEW MODAL:**
```
┌─────────────────────────────────────┐
│  Join Family                    [X] │
├─────────────────────────────────────┤
│                                     │
│  [📷 Scan QR] [⌨️ Enter Code]       │  ← Tab selector
├─────────────────────────────────────┤
│                                     │
│  Enter the 6-character invite code: │
│                                     │
│  ┌─────────────────────────────────┐│
│  │ A  B  C  1  2  3                ││  ← Code input
│  └─────────────────────────────────┘│
│                                     │
│  ┌─────────────────────────────────┐│
│  │         Join Family             ││
│  └─────────────────────────────────┘│
│                                     │
└─────────────────────────────────────┘
```

**QR Scanner Tab:**
```
┌─────────────────────────────────────┐
│  Join Family                    [X] │
├─────────────────────────────────────┤
│                                     │
│  [📷 Scan QR] [⌨️ Enter Code]       │  ← QR selected
├─────────────────────────────────────┤
│                                     │
│  ┌─────────────────────────────────┐│
│  │                                 ││
│  │      [CAMERA VIEWFINDER]        ││
│  │                                 ││
│  │     Point at QR code to scan    ││
│  │                                 ││
│  └─────────────────────────────────┘│
│                                     │
└─────────────────────────────────────┘
```

### Family Detail Screen (NEW)

**NEW SCREEN:**
```
┌─────────────────────────────────────┐
│  ← Silva Household            [⚙️]  │
├─────────────────────────────────────┤
│                                     │
│  Members (4):                       │
│                                     │
│  ┌─────────────────────────────────┐│
│  │ 👤 João (you)           Admin   ││
│  └─────────────────────────────────┘│
│  ┌─────────────────────────────────┐│
│  │ 👤 Maria                Admin   ││
│  └─────────────────────────────────┘│
│  ┌─────────────────────────────────┐│
│  │ 👤 Pedro               Member   ││
│  │                    [Make Admin] ││  ← Admin action
│  │                       [Remove]  ││
│  └─────────────────────────────────┘│
│  ┌─────────────────────────────────┐│
│  │ 👤 Ana                 Member   ││
│  └─────────────────────────────────┘│
│                                     │
│  ─────────────────────────────────  │
│                                     │
│  ┌─────────────────────────────────┐│
│  │       [Invite Members]          ││
│  └─────────────────────────────────┘│
│                                     │
│  [Leave Family]                     │
│                                     │
└─────────────────────────────────────┘
```

### Family Selector (Header Component)

**NEW COMPONENT (in app header when user has families):**
```
┌─────────────────────────────────────┐
│  SaborSpin          [🏠 Silva ▼]   │  ← Family selector
├─────────────────────────────────────┤

Dropdown when tapped:
┌─────────────────────────────────────┐
│  Switch Family:                     │
│  ┌─────────────────────────────────┐│
│  │ ✓ 🏠 Silva Household            ││  ← Current
│  │   👨‍👩‍👧 Extended Family            ││
│  │   ────────────────────────────  ││
│  │   👤 Personal (no family)       ││  ← For personal-only mode
│  └─────────────────────────────────┘│
└─────────────────────────────────────┘
```

---

## Features

### 4.1 Local User Identity

**What:** Each device has a local user identity with display name and cryptographic keys.

**Data Model:**

```sql
CREATE TABLE users (
  id TEXT PRIMARY KEY,
  display_name TEXT NOT NULL,
  public_key TEXT NOT NULL,
  private_key_encrypted TEXT NOT NULL,  -- Encrypted with device key
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
```

---

### Database Migration Pattern

This project uses a **versioned migration system** in `lib/database/migrations.ts`. Each migration has a version number and an idempotent `up` function.

**Add migrations for users and families tables:**

```typescript
// In lib/database/migrations.ts - add to migrations array
// Version number depends on which phases are implemented first

{
  version: 8,  // Adjust based on current version
  up: async (db: DatabaseAdapter) => {
    // 1. Create users table (idempotent)
    await db.runAsync(`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        display_name TEXT NOT NULL,
        public_key TEXT NOT NULL,
        private_key_encrypted TEXT NOT NULL,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      )
    `);

    // 2. Create families table (idempotent)
    await db.runAsync(`
      CREATE TABLE IF NOT EXISTS families (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        invite_code TEXT NOT NULL UNIQUE,
        created_by TEXT NOT NULL,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL,
        FOREIGN KEY (created_by) REFERENCES users(id)
      )
    `);

    // 3. Create family_members table (idempotent)
    await db.runAsync(`
      CREATE TABLE IF NOT EXISTS family_members (
        id TEXT PRIMARY KEY,
        family_id TEXT NOT NULL,
        user_id TEXT NOT NULL,
        user_display_name TEXT NOT NULL,
        user_public_key TEXT NOT NULL,
        role TEXT NOT NULL DEFAULT 'member',
        joined_at TEXT NOT NULL,
        FOREIGN KEY (family_id) REFERENCES families(id) ON DELETE CASCADE,
        UNIQUE(family_id, user_id)
      )
    `);
  },
}
```

**How the migration system works:**
1. `migrations` table tracks applied versions
2. `runMigrations(db)` runs on app startup
3. Only migrations with `version > currentVersion` are executed
4. `CREATE TABLE IF NOT EXISTS` ensures idempotency
5. Each migration is recorded after success

**Why this is safe:**
- New tables don't affect existing data
- `IF NOT EXISTS` prevents errors if migration runs twice
- Old app versions ignore the new tables
- Foreign keys reference existing users table created in same migration

---

**Key Generation:**

```typescript
import * as Crypto from 'expo-crypto';

async function generateUserIdentity(displayName: string): Promise<User> {
  const id = Crypto.randomUUID();

  // Generate key pair for signing
  // Note: expo-crypto has limited key generation
  // May need react-native-quick-crypto for full RSA/EC support
  const keyPair = await generateKeyPair();  // Implementation TBD

  return {
    id,
    displayName,
    publicKey: keyPair.publicKey,
    privateKeyEncrypted: await encryptPrivateKey(keyPair.privateKey),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}
```

**First Launch Flow:**
1. App detects no user exists
2. Shows "Welcome to SaborSpin" screen
3. Prompts for display name
4. Creates user identity
5. Proceeds to main app

---

### 4.2 Family Data Model

**Tables:**

```sql
-- Families
CREATE TABLE families (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  invite_code TEXT NOT NULL UNIQUE,
  created_by TEXT NOT NULL,  -- user_id of creator
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY (created_by) REFERENCES users(id)
);

-- Family membership
CREATE TABLE family_members (
  id TEXT PRIMARY KEY,
  family_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  user_display_name TEXT NOT NULL,  -- Cached for offline display
  user_public_key TEXT NOT NULL,    -- For signature verification
  role TEXT NOT NULL DEFAULT 'member',  -- 'admin' | 'member'
  joined_at TEXT NOT NULL,
  FOREIGN KEY (family_id) REFERENCES families(id) ON DELETE CASCADE,
  UNIQUE(family_id, user_id)
);
```

**Invite Code Generation:**

```typescript
function generateInviteCode(): string {
  // 6 alphanumeric characters, easy to type
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';  // Avoid confusing chars
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}
```

---

### 4.3 Family Creation Flow

**User Flow:**
1. User taps "Create Family" in Settings
2. Enters family name (e.g., "Silva Household")
3. App generates:
   - Family ID (UUID)
   - Invite code (6 chars)
4. User becomes admin
5. Shows sharing options (QR, link, code)

**Store Actions:**

```typescript
interface StoreActions {
  createFamily: (name: string) => Promise<Family>;
  getMyFamilies: () => Family[];
  getCurrentFamily: () => Family | null;
  setCurrentFamily: (familyId: string) => void;
}
```

**Implementation:**

```typescript
async function createFamily(name: string): Promise<Family> {
  const user = getCurrentUser();
  if (!user) throw new Error('No user identity');

  const family: Family = {
    id: Crypto.randomUUID(),
    name,
    inviteCode: generateInviteCode(),
    createdBy: user.id,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  // Save family
  await db.insert('families', family);

  // Add creator as admin
  await db.insert('family_members', {
    id: Crypto.randomUUID(),
    familyId: family.id,
    userId: user.id,
    userDisplayName: user.displayName,
    userPublicKey: user.publicKey,
    role: 'admin',
    joinedAt: new Date().toISOString(),
  });

  return family;
}
```

---

### 4.4 Family Joining Flow

**Connection Methods:**

| Method | How It Works |
|--------|--------------|
| **QR Code** | Admin shows QR containing invite code → member scans |
| **Invite Link** | `saborspin://join?code=ABC123` deep link |
| **Manual Code** | Member types 6-char code manually |

**QR Code Generation:**

```typescript
import QRCode from 'react-native-qrcode-svg';

// In component
<QRCode
  value={`saborspin://join?code=${family.inviteCode}`}
  size={200}
/>
```

**Deep Link Handling:**

```typescript
// app.config.ts
export default {
  scheme: 'saborspin',
  // ...
};

// In app
import * as Linking from 'expo-linking';

Linking.addEventListener('url', ({ url }) => {
  const parsed = Linking.parse(url);
  if (parsed.path === 'join' && parsed.queryParams?.code) {
    joinFamilyByCode(parsed.queryParams.code);
  }
});
```

**Join Flow:**

```typescript
async function joinFamily(inviteCode: string): Promise<Family> {
  const user = getCurrentUser();
  if (!user) throw new Error('No user identity');

  // Find family by code (local lookup for now, server in Phase 6)
  const family = await db.query('SELECT * FROM families WHERE invite_code = ?', [inviteCode]);
  if (!family) throw new Error('Invalid invite code');

  // Check not already a member
  const existing = await db.query(
    'SELECT * FROM family_members WHERE family_id = ? AND user_id = ?',
    [family.id, user.id]
  );
  if (existing) throw new Error('Already a member');

  // Add as member
  await db.insert('family_members', {
    id: Crypto.randomUUID(),
    familyId: family.id,
    userId: user.id,
    userDisplayName: user.displayName,
    userPublicKey: user.publicKey,
    role: 'member',
    joinedAt: new Date().toISOString(),
  });

  return family;
}
```

**Note:** In Phase 4, joining only works if you already have the family data locally (e.g., same device created it, or manual import). True remote joining requires Phase 6 (HTTP Sync).

---

### 4.5 Family Management UI

**New Screens:**

1. **Family List Screen** (`app/(tabs)/families.tsx`)
   - List of families user belongs to
   - Current family indicator
   - "Create Family" button
   - "Join Family" button

2. **Family Detail Screen** (`app/family/[familyId].tsx`)
   - Family name (editable by admin)
   - Member list with roles
   - Invite options (QR, link, code)
   - Leave family option
   - Admin: Remove member, promote to admin

3. **Join Family Modal**
   - QR scanner tab
   - Manual code entry tab

**Family Selector:**

```typescript
// In header or settings
<FamilySelector
  families={myFamilies}
  currentFamily={currentFamily}
  onSelect={(familyId) => setCurrentFamily(familyId)}
/>
```

---

### 4.6 Role Management

**Roles:**
- **Admin (1-2 per family):** Can invite/remove members, edit family, manage settings
- **Member:** Can view family data, contribute meals (in later phases)

**Admin Actions:**
- Promote member to admin
- Demote admin to member (if another admin exists)
- Remove member
- Delete family (if sole admin)

**Implementation:**

```typescript
async function promoteToAdmin(familyId: string, userId: string): Promise<void> {
  const currentUser = getCurrentUser();
  const membership = await getMembership(familyId, currentUser.id);

  if (membership.role !== 'admin') {
    throw new Error('Only admins can promote members');
  }

  // Count current admins
  const admins = await db.query(
    'SELECT COUNT(*) as count FROM family_members WHERE family_id = ? AND role = ?',
    [familyId, 'admin']
  );

  if (admins.count >= 2) {
    throw new Error('Maximum 2 admins per family');
  }

  await db.update('family_members', { role: 'admin' }, { family_id: familyId, user_id: userId });
}
```

---

## Implementation Order

| Order | Task | Type | Effort | Notes |
|-------|------|------|--------|-------|
| 1 | ▶️ RUN existing test suites | Testing | ~15 min | Baseline: unit, Playwright E2E, Maestro | not started |
| 2 | ▶️ RUN quality baseline | Quality | ~30 min | arch:test, lint:dead-code, lint:duplicates, security:scan | not started |
| 3 | Add users table + identity generation | Implementation | ~3 hours | Migration + crypto | not started |
| 4 | 🧪 CREATE unit tests for identity generation | Testing | ~1 hour | Test key pair creation, UUID, storage | not started |
| 5 | First launch flow (name prompt) | Implementation | ~2 hours | UI | not started |
| 6 | 🧪 CREATE Playwright E2E test for first launch | Testing | ~1 hour | Test name prompt appears, saves identity | not started |
| 7 | 🧪 CREATE Maestro test for first launch | Testing | ~1 hour | Mirror Playwright test for mobile | not started |
| 8 | Add families + family_members tables | Implementation | ~1 hour | Migration | not started |
| 9 | 🧪 CREATE unit tests for family migrations | Testing | ~30 min | Test table creation, constraints | not started |
| 10 | Family creation flow | Implementation | ~3 hours | Store + UI | not started |
| 11 | 🧪 CREATE unit tests for `createFamily()` | Testing | ~1 hour | Test family + admin membership creation | not started |
| 12 | 🧪 CREATE unit tests for `generateInviteCode()` | Testing | ~30 min | Test code format, uniqueness | not started |
| 13 | 🧪 CREATE Playwright E2E test for family creation | Testing | ~1.5 hours | Test create family, see invite code | not started |
| 14 | 🧪 CREATE Maestro test for family creation | Testing | ~1.5 hours | Mirror Playwright test for mobile | not started |
| 15 | QR code generation | Implementation | ~2 hours | Library integration | not started |
| 16 | Join family flow (code entry) | Implementation | ~3 hours | UI + store | not started |
| 17 | 🧪 CREATE unit tests for `joinFamily()` | Testing | ~1 hour | Test code validation, member addition | not started |
| 18 | 🧪 CREATE Playwright E2E test for join family | Testing | ~1.5 hours | Test enter code, join family | not started |
| 19 | 🧪 CREATE Maestro test for join family | Testing | ~1.5 hours | Mirror Playwright test for mobile | not started |
| 20 | Deep link handling | Implementation | ~2 hours | Expo linking | not started |
| 21 | 🧪 CREATE unit tests for deep link parsing | Testing | ~30 min | Test URL extraction, edge cases | not started |
| 22 | Family list screen | Implementation | ~3 hours | New screen | not started |
| 23 | Family detail screen | Implementation | ~4 hours | New screen | not started |
| 24 | 🧪 CREATE Playwright E2E test for family screens | Testing | ~1.5 hours | Test navigation, member list | not started |
| 25 | 🧪 CREATE Maestro test for family screens | Testing | ~1.5 hours | Mirror Playwright test for mobile | not started |
| 26 | Role management | Implementation | ~2 hours | Admin actions | not started |
| 27 | 🧪 CREATE unit tests for role checks | Testing | ~45 min | Test admin vs member permissions | not started |
| 28 | Family selector component | Implementation | ~2 hours | Header component | not started |
| 29 | 🧪 CREATE unit tests for context switching | Testing | ~30 min | Test family context isolation | not started |
| 30 | 🧪 CREATE Playwright E2E test for family switching | Testing | ~1 hour | Test switch between families | not started |
| 31 | 🧪 CREATE Maestro test for family switching | Testing | ~1 hour | Mirror Playwright test for mobile | not started |
| 32 | ▶️ RUN full test suites | Testing | ~20 min | Unit + Playwright + Maestro, verify no regressions | not started |
| 33 | ▶️ RUN quality checks and compare | Quality | ~30 min | Compare to baseline; create remediation plan if worse | not started |
| 34 | Document learning notes | Documentation | ~30 min | Capture unexpected errors, workarounds, fixes | not started |
| 35 | Run all existing unit tests, Playwright tests and Maestro Tests | Quality | ~0.5 hours | not started |

**Total Estimated Effort:** ~49.5 hours (including unit + Playwright + Maestro tests + quality checks)

**Legend:**
- 🧪 CREATE = Writing new tests
- 🔄 UPDATE = Modifying existing tests
- ▶️ RUN = Executing tests (baseline/verification)

---

## Testing Strategy

### Unit Tests (🧪 CREATE new tests)
- [ ] `generateInviteCode()` produces valid codes
- [ ] `createFamily()` creates family and membership
- [ ] `joinFamily()` adds member correctly
- [ ] Role checks work correctly
- [ ] Admin actions enforce permissions

### E2E Tests - Playwright (🧪 CREATE new tests)
- [ ] Can create user identity on first launch
- [ ] Can create a family
- [ ] Can view invite QR code
- [ ] Can join family by code
- [ ] Can switch between families
- [ ] Admin can remove member

### Mobile E2E Tests - Maestro (🧪 CREATE new tests)
- [ ] Mirror all Playwright tests for mobile verification

### Existing Tests (▶️ RUN for regression check)
- Run before implementation to establish baseline
- Run after implementation to verify no regressions

---

## Deployment Strategy

### Release Type
**Major Feature Release** - New user identity and family system, foundational for future phases

### Pre-Deployment Checklist
- [ ] All unit tests passing
- [ ] All E2E tests passing (Playwright + Maestro)
- [ ] Crypto operations tested across devices
- [ ] QR code/invite link generation tested
- [ ] Family joining flow tested
- [ ] Quality baseline comparison completed
- [ ] Manual QA on multiple physical devices
- [ ] Version bump in `app.json`

### Feature Flags (Recommended)
```typescript
// Consider feature flag for gradual rollout
const ENABLE_FAMILIES = process.env.EXPO_PUBLIC_ENABLE_FAMILIES === 'true';
```

### Build & Release
```bash
# 1. Bump version (minor - new major feature)
npm version minor

# 2. Build preview APK
eas build --platform android --profile preview

# 3. Test scenarios:
#    - Create user identity
#    - Create family
#    - Join via QR code
#    - Join via invite code
#    - Join via link
#    - Multi-family membership

# 4. Build production release
eas build --platform android --profile production

# 5. Staged rollout (feature is opt-in)
```

### Rollback Plan
- Feature is opt-in - users without families unaffected
- Revert APK if critical issues
- User/family data remains in SQLite, can be recovered

### Post-Deployment
- Monitor OTel error spans for crypto/identity errors
- Track family creation rate
- Monitor invite success rate (QR vs code vs link)

---

## Files to Create/Modify

**New Files:**
- `app/(tabs)/families.tsx` - Family list screen
- `app/family/[familyId].tsx` - Family detail screen
- `app/onboarding/index.tsx` - First launch flow
- `components/FamilySelector.tsx` - Family switcher
- `components/QRCodeDisplay.tsx` - QR code component
- `components/JoinFamilyModal.tsx` - Join flow
- `lib/crypto/keys.ts` - Key generation utilities
- `docs/learning/epic04_feature_enhancement/PHASE4_LEARNING_NOTES.md` - Learning notes

**Modified Files:**
- `lib/database/migrations.ts` - New tables
- `lib/database/operations.ts` - User/family queries
- `lib/store/index.ts` - User and family state
- `types/index.ts` - User, Family, FamilyMember types
- `app/_layout.tsx` - Check for user identity
- `app/(tabs)/settings.tsx` - Link to families

---

## Security Considerations

1. **Private Key Storage:**
   - Encrypted with device-specific key
   - Never transmitted
   - Used only for signing

2. **Invite Codes:**
   - Short-lived (consider expiration in future)
   - Can be regenerated by admin
   - One-time use option (future)

3. **Role Enforcement:**
   - Check role before admin actions
   - Prevent removing last admin
   - Audit log (future)

---

## Success Criteria

Phase 4 is complete when:
- [ ] Users have local identity with display name
- [ ] Users can create families
- [ ] Families have invite codes
- [ ] QR codes display correctly
- [ ] Users can join families by code
- [ ] Users can switch between families
- [ ] Admins can manage members
- [ ] All tests pass

---

## Learning Notes

Document unexpected errors, workarounds, and fixes encountered during implementation:

**[Phase 4 Learning Notes →](./PHASE4_LEARNING_NOTES.md)**

---

## Reference

See [Approach 2: Family Kitchen - Section 2.2](../../product_info/meals-randomizer-exploration.md#22-family-structure--roles) for family structure design.

### Developer Guides

- [Testing Guide](../../developer-guide/TESTING.md) - Unit testing patterns
- [Maestro Testing](../../developer-guide/MAESTRO_TESTING.md) - Mobile E2E testing
- [Architecture Rules](../../developer-guide/ARCHITECTURE_RULES.md) - Architecture testing
- [Database Schema](../../architecture/DATABASE_SCHEMA.md) - User/family table design
- [State Management](../../architecture/STATE_MANAGEMENT.md) - Family store patterns
