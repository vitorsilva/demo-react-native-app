# Phase 7: Proposals & Voting

**Status:** 📋 PLANNED

**Goal:** Collaborative meal planning within families

**Dependencies:** Phase 6 (HTTP Sync)

---

## Overview

This phase enables family collaboration:
1. Propose meals to the family ("Let's have tacos tomorrow")
2. Family members vote yes/no
3. Push notifications for new proposals
4. Proposal status tracking

---

## UI Wireframes: Before & After

### Suggestion Screen (Propose Button)

**BEFORE:**
```
┌─────────────────────────────────────┐
│  ← Dinner Suggestions               │
├─────────────────────────────────────┤
│                                     │
│  ┌─────────────────────────────────┐│
│  │ 🟢                       [New!] ││
│  │                                 ││
│  │  fried chicken + potatoes       ││
│  │                                 ││
│  │         [Select]    [⭐]        ││
│  └─────────────────────────────────┘│
│                                     │
│  [Refresh]                          │
│                                     │
└─────────────────────────────────────┘
```

**AFTER:**
```
┌─────────────────────────────────────┐
│  ← Dinner Suggestions               │
├─────────────────────────────────────┤
│                                     │
│  ┌─────────────────────────────────┐│
│  │ 🟢                       [New!] ││
│  │                                 ││
│  │  fried chicken + potatoes       ││
│  │                                 ││
│  │  [Select]  [Propose 👨‍👩‍👧‍👦]  [⭐]  ││  ← NEW button
│  └─────────────────────────────────┘│
│                                     │
│  [Refresh]                          │
│                                     │
└─────────────────────────────────────┘

Note: "Propose" button only visible when user
is in a family. Opens proposal modal.
```

### Create Proposal Modal (NEW)

**NEW SCREEN:**
```
┌─────────────────────────────────────┐
│  Propose to Family              [X] │
├─────────────────────────────────────┤
│                                     │
│  Meal                               │
│  ┌─────────────────────────────────┐│
│  │ fried chicken + roasted potatoes││
│  └─────────────────────────────────┘│
│                                     │
│  Name this meal (optional)          │
│  ┌─────────────────────────────────┐│
│  │ e.g., "Mom's special"           ││
│  └─────────────────────────────────┘│
│                                     │
│  When?                              │
│  ┌───────┐ ┌──────────┐ ┌─────────┐│
│  │ Today │ │ Tomorrow │ │Pick Date││
│  └───────┘ └──────────┘ └─────────┘│
│                ▲ selected           │
│                                     │
│  For which meal?                    │
│  ┌─────────────────────────────────┐│
│  │ Dinner                      [▼] ││
│  └─────────────────────────────────┘│
│                                     │
│  Note (optional)                    │
│  ┌─────────────────────────────────┐│
│  │ I found chicken on sale!        ││
│  └─────────────────────────────────┘│
│                                     │
│  ┌─────────────────────────────────┐│
│  │         [Send Proposal]         ││
│  └─────────────────────────────────┘│
│                                     │
└─────────────────────────────────────┘
```

### Tab Bar (New Proposals Tab)

**BEFORE:**
```
┌─────────────────────────────────────┐
│                                     │
│  [🏠]      [📜]      [⚙️]           │
│  Home    History   Settings         │
│                                     │
└─────────────────────────────────────┘
```

**AFTER:**
```
┌─────────────────────────────────────┐
│                                     │
│  [🏠]   [📜]    [🗳️]    [⚙️]       │
│  Home  History Proposals Settings   │
│                 (2)  ← badge        │
│                                     │
└─────────────────────────────────────┘

Note: Badge shows count of open proposals
awaiting user's vote.
```

### Proposals Feed (NEW Tab)

**NEW SCREEN:**
```
┌─────────────────────────────────────┐
│  Proposals             [🏠 Silva ▼] │
├─────────────────────────────────────┤
│  [Open (2)]  [Decided]  [Mine]      │
├─────────────────────────────────────┤
│                                     │
│  Open Proposals                     │
│                                     │
│  ┌─────────────────────────────────┐│
│  │ 🍽️ "Mom's chicken"              ││
│  │ fried chicken + roasted potatoes││
│  │                                 ││
│  │ 📅 Tomorrow (Dinner)            ││
│  │ 👤 João • 💬 "Chicken on sale!" ││
│  │                                 ││
│  │ ┌─────────────┐ ┌─────────────┐ ││
│  │ │  👍 Yes (2) │ │  👎 No (0)  │ ││
│  │ └─────────────┘ └─────────────┘ ││
│  │                                 ││
│  │ ⏱️ Expires in 8 hours           ││
│  └─────────────────────────────────┘│
│                                     │
│  ┌─────────────────────────────────┐│
│  │ 🍕 Pizza night                  ││
│  │ pizza + salad                   ││
│  │                                 ││
│  │ 📅 Saturday (Dinner)            ││
│  │ 👤 Maria                        ││
│  │                                 ││
│  │ ┌─────────────┐ ┌─────────────┐ ││
│  │ │  👍 Yes (1) │ │  👎 No (0)  │ ││
│  │ └─────────────┘ └─────────────┘ ││
│  │                                 ││
│  │ ⏱️ Expires in 2 days            ││
│  └─────────────────────────────────┘│
│                                     │
└─────────────────────────────────────┘
```

### Proposal Card States

**VOTED STATE:**
```
┌─────────────────────────────────────┐
│ 🍽️ "Mom's chicken"                  │
│ fried chicken + roasted potatoes    │
│                                     │
│ 📅 Tomorrow (Dinner)                │
│ 👤 João                             │
│                                     │
│ ┌───────────────┐ ┌───────────────┐ │
│ │ 👍 Yes (2)    │ │   👎 No (1)   │ │
│ │ ✓ You voted   │ │               │ │
│ └───────────────┘ └───────────────┘ │
│                                     │
│ ⏱️ Expires in 8 hours               │
└─────────────────────────────────────┘
```

**ACCEPTED STATE:**
```
┌─────────────────────────────────────┐
│ 🎉 ACCEPTED                         │
├─────────────────────────────────────┤
│ "Mom's chicken"                     │
│ fried chicken + roasted potatoes    │
│                                     │
│ 📅 Tomorrow (Dinner)                │
│ ✅ 3 yes • ❌ 0 no                   │
│                                     │
│ [Add to Calendar]                   │
└─────────────────────────────────────┘
```

**REJECTED STATE:**
```
┌─────────────────────────────────────┐
│ ❌ NOT APPROVED                     │
├─────────────────────────────────────┤
│ "Mom's chicken"                     │
│ fried chicken + roasted potatoes    │
│                                     │
│ 📅 Tomorrow (Dinner)                │
│ ✅ 1 yes • ❌ 2 no                   │
└─────────────────────────────────────┘
```

### Push Notification Examples

**NEW PROPOSAL:**
```
┌─────────────────────────────────────┐
│ 🍽️ SaborSpin                        │
├─────────────────────────────────────┤
│ New Meal Proposal                   │
│                                     │
│ João proposed "Mom's chicken" for   │
│ tomorrow's dinner                   │
│                                     │
│ [Vote Now]           [Later]        │
└─────────────────────────────────────┘
```

**PROPOSAL ACCEPTED:**
```
┌─────────────────────────────────────┐
│ 🎉 SaborSpin                        │
├─────────────────────────────────────┤
│ Proposal Accepted!                  │
│                                     │
│ "Mom's chicken" is on for           │
│ tomorrow's dinner                   │
│                                     │
│ [View]               [Dismiss]      │
└─────────────────────────────────────┘
```

---

## Features

### 7.1 Proposal Data Model

**Tables:**

```sql
-- Meal proposals
CREATE TABLE meal_proposals (
  id TEXT PRIMARY KEY,
  family_id TEXT NOT NULL,
  proposed_by TEXT NOT NULL,  -- user_id
  meal_description TEXT NOT NULL,
  meal_name TEXT,             -- Optional name
  proposed_date TEXT NOT NULL, -- When to have this meal
  meal_type_id TEXT,          -- breakfast, lunch, dinner
  status TEXT NOT NULL DEFAULT 'open',  -- 'open' | 'accepted' | 'rejected' | 'expired'
  expires_at TEXT,            -- Auto-expire if no decision
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY (family_id) REFERENCES families(id) ON DELETE CASCADE,
  FOREIGN KEY (proposed_by) REFERENCES users(id)
);

-- Votes on proposals
CREATE TABLE proposal_votes (
  id TEXT PRIMARY KEY,
  proposal_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  vote TEXT NOT NULL,  -- 'yes' | 'no'
  voted_at TEXT NOT NULL,
  FOREIGN KEY (proposal_id) REFERENCES meal_proposals(id) ON DELETE CASCADE,
  PRIMARY KEY (proposal_id, user_id)
);
```

**Types:**

```typescript
interface MealProposal {
  id: string;
  familyId: string;
  proposedBy: string;
  mealDescription: string;  // "fried chicken + roasted potatoes"
  mealName: string | null;  // "Mom's chicken"
  proposedDate: string;
  mealTypeId: string | null;
  status: 'open' | 'accepted' | 'rejected' | 'expired';
  expiresAt: string | null;
  createdAt: string;
  updatedAt: string;
  // Computed
  votes?: ProposalVote[];
  yesCount?: number;
  noCount?: number;
}

interface ProposalVote {
  id: string;
  proposalId: string;
  userId: string;
  vote: 'yes' | 'no';
  votedAt: string;
}
```

---

### 7.2 Create Proposal Flow

**User Flow:**
1. User generates suggestions (existing flow)
2. Instead of "Log Meal", tap "Propose to Family"
3. Select date (today, tomorrow, or pick date)
4. Optionally select meal type (lunch, dinner)
5. Add optional note
6. Submit proposal

**UI:**

```
┌─────────────────────────────────────┐
│  Propose to Family                  │
├─────────────────────────────────────┤
│                                     │
│  Meal                               │
│  ┌─────────────────────────────────┐│
│  │ fried chicken + roasted potatoes││
│  └─────────────────────────────────┘│
│                                     │
│  When?                              │
│  [Today] [Tomorrow] [Pick Date]     │
│                                     │
│  For which meal?                    │
│  [Lunch ▼]                          │
│                                     │
│  Note (optional)                    │
│  ┌─────────────────────────────────┐│
│  │ I found chicken on sale!        ││
│  └─────────────────────────────────┘│
│                                     │
│  [Cancel]           [Propose]       │
│                                     │
└─────────────────────────────────────┘
```

**Store Action:**

```typescript
async function createProposal(
  familyId: string,
  mealDescription: string,
  proposedDate: string,
  options?: {
    mealName?: string;
    mealTypeId?: string;
    note?: string;
    expiresIn?: number;  // hours
  }
): Promise<MealProposal> {
  const user = await getCurrentUser();

  const proposal: MealProposal = {
    id: Crypto.randomUUID(),
    familyId,
    proposedBy: user.id,
    mealDescription,
    mealName: options?.mealName || null,
    proposedDate,
    mealTypeId: options?.mealTypeId || null,
    status: 'open',
    expiresAt: options?.expiresIn
      ? addHours(new Date(), options.expiresIn).toISOString()
      : null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  await db.insert('meal_proposals', proposal);

  // Auto-vote yes for proposer
  await voteOnProposal(proposal.id, 'yes');

  // Track for sync
  await trackChange(familyId, 'meal_proposal', proposal.id, 'create', proposal);

  return proposal;
}
```

---

### 7.3 Voting Flow

**User Flow:**
1. User receives notification "New proposal from João"
2. Opens app, sees proposal in feed
3. Views proposal details
4. Votes yes or no
5. Sees updated vote count

**UI - Proposal Card:**

```
┌─────────────────────────────────────┐
│  🍽️ Proposal from João              │
├─────────────────────────────────────┤
│                                     │
│  "Mom's chicken"                    │
│  fried chicken + roasted potatoes   │
│                                     │
│  📅 Tomorrow (Lunch)                │
│  💬 "I found chicken on sale!"      │
│                                     │
│  Votes: 2 yes, 1 no                 │
│  ┌───────┐ ┌───────┐                │
│  │  👍   │ │  👎   │                │
│  │  Yes  │ │  No   │                │
│  └───────┘ └───────┘                │
│                                     │
│  Expires in 8 hours                 │
│                                     │
└─────────────────────────────────────┘
```

**Store Action:**

```typescript
async function voteOnProposal(
  proposalId: string,
  vote: 'yes' | 'no'
): Promise<void> {
  const user = await getCurrentUser();
  const proposal = await getProposal(proposalId);

  // Check not already voted
  const existingVote = await db.query(
    'SELECT * FROM proposal_votes WHERE proposal_id = ? AND user_id = ?',
    [proposalId, user.id]
  );

  if (existingVote) {
    // Update vote
    await db.update('proposal_votes', { vote, votedAt: new Date().toISOString() }, {
      proposal_id: proposalId,
      user_id: user.id,
    });
  } else {
    // New vote
    await db.insert('proposal_votes', {
      id: Crypto.randomUUID(),
      proposalId,
      userId: user.id,
      vote,
      votedAt: new Date().toISOString(),
    });
  }

  // Track for sync
  await trackChange(proposal.familyId, 'proposal_vote', `${proposalId}_${user.id}`, 'create', {
    proposalId,
    userId: user.id,
    vote,
  });

  // Check if proposal should be resolved
  await checkProposalResolution(proposalId);
}
```

---

### 7.4 Proposal Resolution

**Resolution Rules:**
- **Accepted:** Majority yes votes (>50% of family)
- **Rejected:** Majority no votes (>50% of family)
- **Expired:** Deadline passed without decision

```typescript
async function checkProposalResolution(proposalId: string): Promise<void> {
  const proposal = await getProposal(proposalId);
  if (proposal.status !== 'open') return;

  const family = await getFamily(proposal.familyId);
  const members = await getFamilyMembers(proposal.familyId);
  const votes = await getProposalVotes(proposalId);

  const yesVotes = votes.filter(v => v.vote === 'yes').length;
  const noVotes = votes.filter(v => v.vote === 'no').length;
  const threshold = Math.ceil(members.length / 2);

  if (yesVotes >= threshold) {
    await updateProposalStatus(proposalId, 'accepted');
  } else if (noVotes >= threshold) {
    await updateProposalStatus(proposalId, 'rejected');
  }

  // Check expiration
  if (proposal.expiresAt && new Date() > new Date(proposal.expiresAt)) {
    await updateProposalStatus(proposalId, 'expired');
  }
}
```

---

### 7.5 Push Notifications

**Notification Types:**

| Event | Notification |
|-------|--------------|
| New proposal | "João proposed 'Mom's chicken' for tomorrow's lunch" |
| Vote cast | "Maria voted yes on 'Mom's chicken'" (optional) |
| Proposal accepted | "🎉 'Mom's chicken' is on for tomorrow!" |
| Proposal rejected | "'Mom's chicken' was not approved" |
| Proposal expiring | "⏰ Vote on 'Mom's chicken' - expires in 1 hour" |

**Implementation:**

```typescript
import * as Notifications from 'expo-notifications';

async function sendProposalNotification(
  proposal: MealProposal,
  type: 'new' | 'accepted' | 'rejected' | 'expiring'
): Promise<void> {
  const proposer = await getUser(proposal.proposedBy);
  const mealName = proposal.mealName || proposal.mealDescription;

  let title: string;
  let body: string;

  switch (type) {
    case 'new':
      title = 'New Meal Proposal';
      body = `${proposer.displayName} proposed "${mealName}"`;
      break;
    case 'accepted':
      title = '🎉 Proposal Accepted!';
      body = `"${mealName}" is on for ${formatDate(proposal.proposedDate)}`;
      break;
    // ... other cases
  }

  await Notifications.scheduleNotificationAsync({
    content: { title, body },
    trigger: null,  // Immediate
  });
}
```

**Server Push (via Sync):**
- When proposal is created/voted, include notification payload in sync
- Receiving device schedules local notification

---

### 7.6 Proposals Feed

**New Screen: Proposals Tab**

```
┌─────────────────────────────────────┐
│  Proposals                          │
├─────────────────────────────────────┤
│  [Open] [Decided] [My Proposals]    │
├─────────────────────────────────────┤
│                                     │
│  Open Proposals (2)                 │
│                                     │
│  ┌─────────────────────────────────┐│
│  │ Mom's chicken                   ││
│  │ Tomorrow (Lunch) • 2/3 votes    ││
│  │ [Vote Now]                      ││
│  └─────────────────────────────────┘│
│                                     │
│  ┌─────────────────────────────────┐│
│  │ Pizza night                     ││
│  │ Saturday (Dinner) • 1/3 votes   ││
│  │ [Vote Now]                      ││
│  └─────────────────────────────────┘│
│                                     │
│  [+ New Proposal]                   │
│                                     │
└─────────────────────────────────────┘
```

---

## Implementation Order

| Order | Task | Effort | Notes |
|-------|------|--------|-------|
| 1 | Run existing test suites | ~15 min | Baseline: unit, Playwright E2E, Maestro |
| 2 | Run quality baseline | ~30 min | test:mutation, arch:test, lint:dead-code, lint:duplicates, security:scan |
| 3 | Add meal_proposals table | ~1 hour | Migration |
| 4 | Add proposal_votes table | ~1 hour | Migration |
| 5 | Write unit tests for migrations | ~30 min | Test table creation |
| 6 | Create proposal store actions | ~3 hours | Store |
| 7 | Write unit tests for `createProposal()` | ~1 hour | Test creation, auto-vote |
| 8 | Write unit tests for `voteOnProposal()` | ~1 hour | Test vote, update existing vote |
| 9 | Create proposal flow UI | ~4 hours | Modal/screen |
| 10 | Write Playwright E2E test for creating proposal | ~1.5 hours | Test propose meal, select date |
| 11 | Write Maestro test for creating proposal | ~1.5 hours | Mirror Playwright test for mobile |
| 12 | Create voting UI | ~3 hours | Component |
| 13 | Write Playwright E2E test for voting | ~1.5 hours | Test vote yes/no, see updated count |
| 14 | Write Maestro test for voting | ~1.5 hours | Mirror Playwright test for mobile |
| 15 | Implement resolution logic | ~2 hours | Business logic |
| 16 | Write unit tests for `checkProposalResolution()` | ~1.5 hours | Test majority, expiration |
| 17 | Create proposals feed screen | ~4 hours | New tab |
| 18 | Write Playwright E2E test for proposals feed | ~1.5 hours | Test view open/decided proposals |
| 19 | Write Maestro test for proposals feed | ~1.5 hours | Mirror Playwright test for mobile |
| 20 | Set up push notifications | ~4 hours | Expo notifications |
| 21 | Write unit tests for notification triggers | ~1 hour | Test event → notification |
| 22 | Integrate with sync | ~3 hours | Sync proposals/votes |
| 23 | Write unit tests for proposal sync | ~1 hour | Test sync payload |
| 24 | Run full test suites | ~20 min | Unit + Playwright + Maestro, verify no regressions |
| 25 | Run quality checks and compare | ~30 min | Compare to baseline; create remediation plan if worse |
| 26 | Document learning notes | ~30 min | Capture unexpected errors, workarounds, fixes |

**Total Estimated Effort:** ~43.5 hours (including unit + Playwright + Maestro tests + quality checks)

---

## Testing Strategy

### Unit Tests
- [ ] Create proposal works
- [ ] Voting updates correctly
- [ ] Resolution logic (majority)
- [ ] Expiration logic
- [ ] Can't vote twice (updates instead)

### E2E Tests
- [ ] Can create proposal
- [ ] Can vote on proposal
- [ ] Proposal shows in feed
- [ ] Accepted proposal shows status
- [ ] Notification appears for new proposal

---

## Files to Create/Modify

**New Files:**
- `app/(tabs)/proposals.tsx` - Proposals feed
- `app/proposal/[proposalId].tsx` - Proposal detail
- `components/ProposalCard.tsx` - Proposal list item
- `components/VotingButtons.tsx` - Yes/No buttons
- `components/CreateProposalModal.tsx` - New proposal flow
- `lib/notifications/proposalNotifications.ts` - Notification helpers
- `docs/learning/epic04_feature_enhancement/PHASE7_LEARNING_NOTES.md` - Learning notes

**Modified Files:**
- `lib/database/migrations.ts` - New tables
- `lib/database/operations.ts` - Proposal queries
- `lib/store/index.ts` - Proposal state and actions
- `lib/sync/syncManager.ts` - Sync proposals
- `types/index.ts` - Proposal types
- `app/(tabs)/_layout.tsx` - Add proposals tab
- `app/suggestions/[mealType].tsx` - "Propose to Family" button

---

## Success Criteria

Phase 7 is complete when:
- [ ] Can create meal proposals
- [ ] Family members can vote
- [ ] Proposals resolve by majority
- [ ] Push notifications work
- [ ] Proposals sync across devices
- [ ] All tests pass

---

## Learning Notes

Document unexpected errors, workarounds, and fixes encountered during implementation:

**[Phase 7 Learning Notes →](./PHASE7_LEARNING_NOTES.md)**

---

## Reference

See [Approach 2: Family Kitchen - Section 2.7](../../product_info/meals-randomizer-exploration.md#27-user-flows) for proposal user flows.

### Developer Guides

- [Testing Guide](../../developer-guide/TESTING.md) - Unit testing patterns
- [Maestro Testing](../../developer-guide/MAESTRO_TESTING.md) - Mobile E2E testing
- [Architecture Rules](../../developer-guide/ARCHITECTURE_RULES.md) - Architecture testing
- [Database Schema](../../architecture/DATABASE_SCHEMA.md) - Proposals/votes schema
- [State Management](../../architecture/STATE_MANAGEMENT.md) - Proposal state patterns
