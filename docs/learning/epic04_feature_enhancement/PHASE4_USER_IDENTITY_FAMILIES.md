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

| Order | Task | Effort | Notes |
|-------|------|--------|-------|
| 1 | Add users table + identity generation | ~3 hours | Migration + crypto |
| 2 | First launch flow (name prompt) | ~2 hours | UI |
| 3 | Add families + family_members tables | ~1 hour | Migration |
| 4 | Family creation flow | ~3 hours | Store + UI |
| 5 | QR code generation | ~2 hours | Library integration |
| 6 | Join family flow (code entry) | ~3 hours | UI + store |
| 7 | Deep link handling | ~2 hours | Expo linking |
| 8 | Family list screen | ~3 hours | New screen |
| 9 | Family detail screen | ~4 hours | New screen |
| 10 | Role management | ~2 hours | Admin actions |
| 11 | Family selector component | ~2 hours | Header component |

**Total Estimated Effort:** ~27 hours

---

## Testing Strategy

### Unit Tests
- [ ] `generateInviteCode()` produces valid codes
- [ ] `createFamily()` creates family and membership
- [ ] `joinFamily()` adds member correctly
- [ ] Role checks work correctly
- [ ] Admin actions enforce permissions

### E2E Tests
- [ ] Can create user identity on first launch
- [ ] Can create a family
- [ ] Can view invite QR code
- [ ] Can join family by code
- [ ] Can switch between families
- [ ] Admin can remove member

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

## Reference

See [Approach 2: Family Kitchen - Section 2.2](../../product_info/meals-randomizer-exploration.md#22-family-structure--roles) for family structure design.
