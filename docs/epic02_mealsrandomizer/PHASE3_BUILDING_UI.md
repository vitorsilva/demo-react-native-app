# Phase 3: Building the UI (5-6 hours)

[← Back to Overview](./OVERVIEW.md) | [Previous: Phase 2](./PHASE2_STATE_MANAGEMENT.md) | [Next: Phase 4 →](./PHASE4_NAVIGATION.md)

---

## Goal

Build the user interface screens and components based on the mockups, focusing on clean, performant, and accessible mobile UI.

## Prerequisites

- Phase 2 completed (state management and core logic working)
- Mockups reviewed

---

## Phase Overview

In this phase, you'll build:

1. **Reusable Components**
   - CombinationCard
   - IngredientBadge
   - MealHistoryItem
   - EmptyState

2. **Main Screens**
   - Home Screen (updated)
   - Suggestions Screen
   - Confirmation Modal

---

## Key Steps

### Step 3.1: Screen Architecture Planning
- Design navigation structure
- Plan component hierarchy
- Define screen flow

### Step 3.2: Creating Reusable Components
- Build CombinationCard component
- Create IngredientBadge with category colors
- Design MealHistoryItem layout
- Add EmptyState messages

### Step 3.3: Building the Home Screen
- Add "Breakfast Ideas" and "Snack Ideas" buttons
- Display recent meals list
- Implement FlatList for meals
- Add loading states

### Step 3.4: Building the Suggestions Screen
- Display 4 combination cards
- Add "Generate New Ideas" button
- Handle meal type filtering
- Implement selection flow

### Step 3.5: Building the Confirmation Modal
- Show selected combination
- Add confirmation button
- Log meal to database
- Navigate back to home

---

## Important Concepts

### Component Composition
Break UI into small, reusable pieces that can be composed together.

### FlatList Optimization
Use FlatList (not .map()) for efficient rendering of long lists:
```typescript
<FlatList
  data={items}
  renderItem={({ item }) => <ItemCard item={item} />}
  keyExtractor={item => item.id}
/>
```

### Styling Patterns
- Use StyleSheet.create() for performance
- Keep styles at bottom of file
- Use category colors for visual distinction
- Implement card-based layouts

### Navigation
- Use useRouter from expo-router
- Pass data via query parameters
- Handle modal screens properly

---

## Component Examples

### CombinationCard Structure
```typescript
<View style={styles.card}>
  <View style={styles.ingredientsContainer}>
    {ingredients.map(ingredient => (
      <IngredientBadge ingredient={ingredient} />
    ))}
  </View>
  <TouchableOpacity onPress={() => onSelect(combination)}>
    <Text>Select</Text>
  </TouchableOpacity>
</View>
```

### IngredientBadge with Colors
```typescript
const CATEGORY_COLORS = {
  protein: '#3b82f6',  // blue
  carb: '#f59e0b',     // amber
  sweet: '#ec4899',    // pink
  fruit: '#10b981',    // green
};
```

---

## Testing Checklist

- [ ] Components render correctly
- [ ] Touch interactions work
- [ ] Navigation flows properly
- [ ] Loading states display
- [ ] Empty states show when needed
- [ ] Data persists after selection
- [ ] UI matches mockups

---

## Phase 3 Summary

**What You'll Accomplish:**
- ✅ Built reusable UI components
- ✅ Updated Home Screen with meal type buttons
- ✅ Created Suggestions Screen with combination cards
- ✅ Built Confirmation Modal for meal logging
- ✅ Implemented FlatList for efficient rendering
- ✅ Added proper navigation between screens

**Key Skills Learned:**
- Component composition and props
- Styling patterns for mobile
- List rendering with FlatList
- Navigation with Expo Router
- Query parameters for screen communication
- Async operations in UI

**Next:** [Phase 4 - Navigation & User Flow](./PHASE4_NAVIGATION.md)

---

**For detailed implementation:** See [LEARNING_PLAN_BACKUP.md](./LEARNING_PLAN_BACKUP.md) lines 1463-2013

[← Back to Overview](./OVERVIEW.md) | [Previous: Phase 2](./PHASE2_STATE_MANAGEMENT.md) | [Next: Phase 4 →](./PHASE4_NAVIGATION.md)
