# Phase 1: Polish Features

[← Back to Overview](./OVERVIEW.md)

---

## 🎯 Goal

Add high-impact features to enhance the product based on real usage and feedback.

---

## 🤔 Choosing Your Feature

### Decision Framework

Before choosing, ask:
1. **Which feature would I use daily?**
2. **Which feature solves a real pain point?**
3. **Which feature is feasible in 2-4 hours?**
4. **Which feature fits the MVP scope?**

### Feature Options

Below are the feature options prioritized by impact/effort:

---

## ⭐ Option 1: Favorite Combinations

**Impact:** High | **Effort:** Low | **Time:** 2-3 hours

### What You'll Build
- Star icon on combination cards
- Save combinations to favorites
- Quick access to favorites from home screen
- Separate "Favorites" tab or section

### Why Choose This
- You find combinations you love and want to repeat
- Provides quick shortcuts
- Complements variety enforcement (intentional repetition)

### Implementation Overview

**Database:**
```sql
CREATE TABLE favorite_combinations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT,
  ingredients TEXT NOT NULL, -- JSON array
  meal_type_id INTEGER REFERENCES meal_types(id),
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);
```

**UI:**
- Star icon on suggestion cards
- "Add to Favorites" action
- Favorites screen/section
- Quick access from home

**State:**
```typescript
// Add to store
favorites: FavoriteCombination[]
addFavorite: (combination: MealCombination) => Promise<void>
removeFavorite: (id: number) => Promise<void>
loadFavorites: () => Promise<void>
```

**Estimated Time:**
- Database: 30 min
- UI components: 1 hour
- Integration: 30 min
- Testing: 30 min

---

## 📊 Option 2: Weekly Variety Report

**Impact:** Medium | **Effort:** Medium | **Time:** 3-4 hours

### What You'll Build
- Analytics screen showing:
  - Total meals logged this week
  - Unique combinations
  - Variety score (0-100)
  - Most/least used ingredients
  - Ingredient frequency chart

### Why Choose This
- Provides insight into eating patterns
- Gamifies variety (score to improve)
- Helps identify repetition
- Visually interesting

### Implementation Overview

**Data Analysis:**
```typescript
interface WeeklyReport {
  totalMeals: number;
  uniqueCombinations: number;
  varietyScore: number;
  topIngredients: { name: string; count: number }[];
  leastUsedIngredients: { name: string; count: number }[];
  streakDays: number;
}
```

**UI:**
- New "Analytics" tab
- Summary cards (total meals, variety score)
- Bar chart for ingredient frequency
- Weekly comparison (this week vs last week)

**Libraries:**
- `react-native-chart-kit` or `victory-native` (charts)

**Estimated Time:**
- Data queries: 1 hour
- Chart integration: 1 hour
- UI design: 1 hour
- Testing: 30 min

---

## 📸 Option 3: Ingredient Photos

**Impact:** Medium | **Effort:** Medium | **Time:** 3-4 hours

### What You'll Build
- Add photos to ingredients
- Image picker integration
- Display photos on cards
- Photo gallery view

### Why Choose This
- More engaging UI
- Helps identify ingredients
- Makes suggestions more appetizing
- Adds personality

### Implementation Overview

**Database:**
```sql
ALTER TABLE ingredients ADD COLUMN photo_uri TEXT;
```

**Features:**
- Image picker (expo-image-picker)
- Thumbnail generation
- Image storage (local file system)
- Fallback icons for ingredients without photos

**Libraries:**
- `expo-image-picker`
- `expo-media-library`
- `expo-file-system`

**Estimated Time:**
- Image picker setup: 1 hour
- Storage implementation: 1 hour
- UI integration: 1 hour
- Testing: 30 min

---

## 🥗 Option 4: Basic Nutrition Tracking

**Impact:** Low-Medium | **Effort:** High | **Time:** 4-5 hours

### What You'll Build
- Add nutrition data to ingredients (calories, protein, carbs, fat)
- Calculate meal totals
- Show nutrition summary on suggestions
- Daily/weekly nutrition totals

### Why Choose This
- Health-conscious users want nutrition info
- Adds value for fitness users
- Helps make informed choices

### Implementation Overview

**Database:**
```sql
ALTER TABLE ingredients ADD COLUMN calories INTEGER;
ALTER TABLE ingredients ADD COLUMN protein_g REAL;
ALTER TABLE ingredients ADD COLUMN carbs_g REAL;
ALTER TABLE ingredients ADD COLUMN fat_g REAL;
```

**Features:**
- Nutrition form in ingredient management
- Calculate totals for combinations
- Show macros on cards
- Daily/weekly summary

**Challenges:**
- Requires nutrition data entry (tedious)
- Accuracy concerns
- Portion size assumptions

**Estimated Time:**
- Database: 1 hour
- Calculations: 1 hour
- UI integration: 2 hours
- Testing: 1 hour

**Note:** This is the highest effort option with moderate impact. Consider only if nutrition is a priority.

---

## 🔔 Option 5: Smart Notifications

**Impact:** Medium | **Effort:** Medium | **Time:** 3-4 hours

### What You'll Build
- Breakfast reminder (e.g., 7:00 AM)
- Snack reminder (e.g., 3:00 PM)
- Configurable times in settings
- Notification with daily suggestion

### Why Choose This
- Proactive meal suggestions
- Increases engagement
- Helps build routine

### Implementation Overview

**Features:**
- Schedule notifications
- Configure times in settings
- Toggle notifications on/off
- Include suggestion in notification

**Libraries:**
- `expo-notifications`
- `expo-task-manager` (background tasks)

**Challenges:**
- Background task limitations
- Notification permissions
- Testing on device required

**Estimated Time:**
- Notification setup: 1 hour
- Background tasks: 1 hour
- Settings UI: 1 hour
- Testing: 1 hour

---

## 🎯 Recommendation

**If you want quick wins:** Choose **Favorite Combinations** ⭐
- Lowest effort
- High perceived value
- Complements existing features

**If you want engagement:** Choose **Weekly Variety Report** 📊
- Gamifies the experience
- Provides insight
- Encourages continued use

**If you want visual appeal:** Choose **Ingredient Photos** 📸
- Makes app more attractive
- Helps with recognition
- Adds personality

**If you want health features:** Choose **Nutrition Tracking** 🥗
- Appeals to fitness users
- Adds differentiation
- Higher effort but valuable for target audience

**If you want proactive engagement:** Choose **Smart Notifications** 🔔
- Increases daily usage
- Builds routine
- Requires device testing

---

## 📋 Implementation Checklist

Regardless of which feature you choose:

### Planning
- [ ] Review feature description
- [ ] Sketch UI mockups
- [ ] Plan database changes
- [ ] Estimate time realistically

### Development
- [ ] Create database migration
- [ ] Implement database operations
- [ ] Add to Zustand store
- [ ] Create UI components
- [ ] Integrate with existing screens
- [ ] Add loading/error states

### Testing
- [ ] Write unit tests
- [ ] Write E2E test
- [ ] Test on device
- [ ] Test edge cases

### Polish
- [ ] Add to documentation
- [ ] Update CHANGELOG
- [ ] Update screenshots
- [ ] Update landing page

---

## ✅ Success Criteria

### Functional
- [ ] Feature works as designed
- [ ] No regressions in existing features
- [ ] All tests pass
- [ ] No TypeScript errors

### Quality
- [ ] Code is clean and documented
- [ ] Feature is tested
- [ ] Error handling is robust
- [ ] Performance is acceptable

### UX
- [ ] Feature is discoverable
- [ ] Feature is intuitive
- [ ] Feedback is immediate
- [ ] Adds real value

---

## 🎓 Learning Outcomes

Depending on feature chosen:
- Database migrations and schema design
- Image handling in React Native
- Charting and data visualization
- Push notifications
- State management patterns
- User experience design

---

[← Back to Overview](./OVERVIEW.md)
