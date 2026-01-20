# Phase 5: Polish & Testing (3-4 hours)

[← Back to Overview](./OVERVIEW.md) | [Previous: Phase 4](./PHASE4_NAVIGATION.md) | [Next: Phase 6 →](../parking-lot/EPIC02_PHASE6_FUTURE_ENHANCEMENTS.md)

---

## Goal

Add final polish, write comprehensive tests, ensure observability coverage, and prepare for real-world usage.

## Prerequisites

- Phases 1-4 completed (app functionally complete)

---

## Phase Overview

In this phase, you'll add:

1. **Loading States & Error Handling**
   - ActivityIndicator for loading
   - Error boundaries
   - Graceful error messages

2. **Comprehensive Testing**
   - Database operation tests
   - Algorithm tests (combination generator, variety scoring)
   - Component tests

3. **Full Observability Integration**
   - Track user actions (meal logging, suggestion generation)
   - Database performance metrics
   - Algorithm performance metrics

4. **UI Polish**
   - Accessibility labels
   - Haptic feedback
   - Simple animations

5. **Production Build**
   - Build APK
   - Test on real device
   - Verify performance

---

## Key Steps

### Step 5.1: Loading States and Error Handling
- Add ActivityIndicator during data loading
- Implement error boundaries
- Create DatabaseError class
- Add safeDbOperation wrapper

### Step 5.2: Writing Tests for Core Functionality
**Database Tests:**
- Test addIngredient, getAllIngredients, deleteIngredient
- Test logMeal, getRecentMealLogs

**Algorithm Tests:**
- Test combination generation
- Verify variety enforcement
- Test scoring logic

**Component Tests:**
- Test CombinationCard renders
- Test button interactions
- Test navigation flows

### Step 5.3: Adding Observability Throughout the App
Track key metrics:
- `meal.logged` counter (by type)
- `suggestion.generated` counter
- `suggestion.selected` counter
- `app.usage.duration` histogram

Add tracing for:
- Database operations
- Combination generation
- User interactions

### Step 5.4: UI Polish and Accessibility
- Add `accessible` and `accessibilityLabel` props
- Implement haptic feedback with expo-haptics
- Add fade-in animations for screens
- Test with screen reader

### Step 5.5: Building APK and Testing on Device
```bash
eas build --platform android --profile preview
```

Test on device:
- All features work offline
- Performance is smooth
- No crashes or memory leaks
- Data persists correctly

---

## Testing Examples

### Database Test
```typescript
describe('Ingredients Database', () => {
  it('should add a new ingredient', async () => {
    const id = await addIngredient({
      name: 'Test Yogurt',
      category: 'protein',
      mealTypes: ['breakfast'],
    });
    expect(id).toBeDefined();
  });
});
```

### Algorithm Test
```typescript
describe('Combination Generator', () => {
  it('should not repeat recent combinations', () => {
    const recentLog = {
      ingredients: ['1', '2'], // milk + cereals
      // ...
    };

    const combinations = generateCombinations(
      mockIngredients,
      [recentLog],
      5,
      3
    );

    // Verify milk + cereals is not suggested
    const hasMilkCereals = combinations.some(/* check */);
    expect(hasMilkCereals).toBe(false);
  });
});
```

### Component Test
```typescript
describe('CombinationCard', () => {
  it('calls onSelect when button is pressed', () => {
    const mockOnSelect = jest.fn();
    const { getByText } = render(
      <CombinationCard combination={mock} onSelect={mockOnSelect} />
    );

    fireEvent.press(getByText('Select'));
    expect(mockOnSelect).toHaveBeenCalled();
  });
});
```

---

## Observability Stack

Ensure these are running:
```bash
docker-compose up -d
```

View data:
- **Traces:** http://localhost:16686 (Jaeger)
- **Metrics:** http://localhost:9090 (Prometheus)
- **Errors:** Sentry dashboard (if configured)

---

## Production Readiness Checklist

**Functional:**
- [ ] All tests pass (`npm test`)
- [ ] Code coverage > 60%
- [ ] No TypeScript errors
- [ ] ESLint passes
- [ ] APK builds successfully

**Performance:**
- [ ] App launches in < 3 seconds
- [ ] Suggestions generate in < 500ms
- [ ] No lag when scrolling lists
- [ ] Database queries are fast

**Quality:**
- [ ] No crashes on device
- [ ] Data persists correctly
- [ ] Error messages are helpful
- [ ] Loading states provide feedback
- [ ] Accessibility labels present

**Observability:**
- [ ] Traces appear in Jaeger
- [ ] Metrics appear in Prometheus
- [ ] User actions are tracked
- [ ] Database performance monitored

---

## Phase 5 Summary

**What You'll Accomplish:**
- ✅ Added loading states and error handling
- ✅ Wrote comprehensive tests (database, algorithms, components)
- ✅ Integrated full observability coverage
- ✅ Added accessibility improvements
- ✅ Implemented haptic feedback
- ✅ Built and tested APK on device

**Key Skills Learned:**
- Error handling patterns
- Testing React Native apps
- Complete instrumentation
- Accessibility best practices
- Production build process

**Next:** [Phase 6 - Future Enhancements (Optional)](./PHASE6_FUTURE_ENHANCEMENTS.md)

---

**For detailed implementation:** See [LEARNING_PLAN_BACKUP.md](./LEARNING_PLAN_BACKUP.md) lines 2526-2990

[← Back to Overview](./OVERVIEW.md) | [Previous: Phase 4](./PHASE4_NAVIGATION.md) | [Next: Phase 6 →](./PHASE6_FUTURE_ENHANCEMENTS.md)
