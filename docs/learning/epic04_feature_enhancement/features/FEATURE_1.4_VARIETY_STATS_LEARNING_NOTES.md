# Feature 1.4: Variety Stats - Learning Notes

## Task 1: Create `calculateVarietyStats()` utility

### What was implemented

1. **Added date utility functions** (`lib/utils/dateUtils.ts`):
   - `isThisMonth(dateString)` - checks if date is in the current calendar month
   - `isThisWeek(dateString)` - checks if date is in the current calendar week (Sunday to Saturday)

2. **Added VarietyStats interface** (`lib/utils/variety.ts`):
   - `uniqueCombosThisMonth: number`
   - `mostCommonCombo: { ingredients: string[]; count: number } | null`
   - `ingredientsUsedThisWeek: number`
   - `totalIngredients: number`
   - `varietyScore: number` (0-100)

3. **Implemented `calculateVarietyStats()` function**:
   - Filters logs by current month for unique combo count
   - Calculates most common combo across all history
   - Counts unique ingredients used this week
   - Computes variety score using the formula:
     `(uniqueCombos / totalLogs) * (ingredientsUsed / totalIngredients) * 100`

### Design decisions

- `mostCommonCombo` can be `null` when there's no history (edge case handling)
- Only counts active ingredients for `totalIngredients`
- Week is defined as Sunday to Saturday (standard US calendar week)
- Most common combo looks at ALL history, not just this month (more meaningful stat)

### Notes

- No issues encountered during implementation
- TypeScript check and linter passed without new errors
- Existing variety.ts already imported `getDaysAgo` from dateUtils, so pattern was established
