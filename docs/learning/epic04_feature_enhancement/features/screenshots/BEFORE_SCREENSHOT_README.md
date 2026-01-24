# BEFORE Screenshot Documentation

## Suggestion Card - Before New! Badge Implementation

Since capturing actual screenshots requires running the app, this document serves as the "BEFORE" reference (Option B from the feature spec).

### Current Suggestion Card Layout (ASCII Wireframe)

```
┌─────────────────────────────────────┐
│                                     │  ← No badge in this area
│  [Background Image]                 │
│                                     │
│  ──────────────────────────────────│
│  milk + cereals     [Accept]  [☆]   │
│                                     │
└─────────────────────────────────────┘
```

### Current Implementation Details

**File:** `app/suggestions/[mealType].tsx`

The suggestion card currently displays:
- Background image with gradient overlay
- Ingredient combination text (e.g., "milk + cereals")
- "Accept" button (blue, rounded)
- Favorite toggle button (☆ for unfavorited, ⭐ for favorited)

**What's Missing (to be added):**
- "New!" badge indicator in the top-right corner
- Logic to determine if a combination is "new" (never tried or not tried in 7+ days)

### Reference Code Structure

The card is rendered inline in the `[mealType].tsx` file (lines 280-350):
- `ImageBackground` component with background image
- `LinearGradient` overlay (native) or dark overlay (web)
- `cardContent` View containing title and action buttons

### Expected AFTER State

After implementation, the card should look like:

```
┌─────────────────────────────────────┐
│                              [New!] │  ← New badge appears here for new combinations
│  [Background Image]                 │
│                                     │
│  ──────────────────────────────────│
│  milk + cereals     [Accept]  [☆]   │
│                                     │
└─────────────────────────────────────┘
```

---

*Document created as part of Feature 1.2: New! Badge implementation*
*Date: 2026-01-24*
