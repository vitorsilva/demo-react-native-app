# Meals Randomizer - Exploration

## Initial Concept

A meal planning app to help families get ideas for meals (breakfast, lunch, dinner, snacks) without the daily mental burden of deciding what to eat. The goal is variety enforcement and decision reduction - avoiding repetition while respecting family food culture and health balance.

**Current Scope: Breakfast & Snack Idea Generator**

To validate the concept, we're starting with the simplest use case: generating breakfast and snack ideas using a combination-based approach.

---

## Problem Statement

**Primary pain points:**
- Decision fatigue from having to think about meals every single day
- Tendency to fall into repetitive eating patterns
- Wanting variety while staying within cultural food preferences (Portuguese traditional family)
- Need to balance healthy eating with occasional treats

**Focus areas (in priority order):**
1. Variety enforcement - actively preventing repetition
2. Decision reduction - removing mental burden of choosing
3. Discovery tool - finding new combinations to try
4. Memory aid - not forgetting what was eaten recently

---

## Breakfast & Snack Scope

### Why Start Here?
- Simplest meal structure to model (combinations of ingredients)
- Clear categories (protein, carbs, sweets, fruits)
- Easier to define variety rules
- Quick validation of the core concept

### Breakfast Structure

Portuguese breakfast typically includes:
- **Protein**: milk, yogurt (Greek or normal), butter, cheese, eggs (rarely)
- **Carbohydrates**: cereals, bread varieties (pão branco, pão mistura, pão de água, pão de forma, italiana, regueifa)
- **Sweet (optional)**: jam, marmelada, cookies

**Examples:**
- Milk + cereals
- Greek yogurt + pão de forma + jam
- Pão branco + butter + cheese
- Milk + cookies
- Eggs + bread

### Snack Structure

Similar to breakfast but:
- **Remove**: milk, yogurt
- **Add**: fruit (apple, banana, pear)
- **Keep**: bread varieties, butter, cheese, jam, marmelada, cookies

**Examples:**
- Apple + pão de água + cheese
- Banana + cookies
- Pão mistura + butter + jam
- Pear

---

## Core Features (V1 - Simple Randomizer)

### 1. Ingredient Repository (Hybrid Approach)

**Store:**
- Available ingredients organized by category
- Favorite/common combinations
- Both can be used to generate suggestions

**Categories:**
- Proteins: milk, Greek yogurt, normal yogurt, butter, cheese, eggs
- Carbs: cereals, pão branco, pão mistura, pão de água, pão de forma, italiana, regueifa
- Sweets: jam, marmelada, cookies
- Fruits: apple, banana, pear

### 2. Combination Generator

**Logic:**
- Combinations can include 1-3 ingredients
- Can skip categories (e.g., just "bread + butter")
- Can combine multiple items from same category (e.g., "bread + butter + cheese")
- No strict rules initially about what pairs with what (learn this from usage)

**Suggestion format:**
- Show detailed combinations: "Greek yogurt + pão de água (toasted) + strawberry jam"
- Generate 3-5 options per request
- Mix known favorites with new experimental combinations

### 3. Variety Enforcement

**Simple rule: Don't repeat the exact same combination**
- Today: milk + cereals
- Tomorrow: Can't be milk + cereals
- Tomorrow: CAN be milk + cookies (different combination)

**Advanced consideration (for future):**
- Track ingredient frequency to encourage rotation
- Ensure bread variety (pão branco yesterday, pão de forma today is fine for now)
- Balance building blocks over time

### 4. Meal Tracking

**Track both breakfast AND snacks throughout the day:**
- Prevents: having "pão + butter" for breakfast and "pão + cheese" for snack
- User marks what they're having: "I'm having this for breakfast/snack"
- System remembers to avoid suggesting it again soon

**Data stored:**
- Date
- Meal type (breakfast or snack)
- Full combination chosen
- Individual ingredients (for future variety analysis)

### 5. AI Variation Suggestions (One Per Day)

**AI can suggest:**
- New sweet options: "Try honey instead of jam"
- New combinations: "Have you tried yogurt with granola?"
- Preparation methods: "Toast the bread vs fresh"
- Fruit additions: "Greek yogurt with banana slices"

**Approach:**
- Show mostly familiar combinations (from repository)
- Include 1 AI-suggested variation per suggestion set
- Occasionally include "off-the-chart" wild card suggestions
- If user picks and likes it, prompt to add to repository

---

## Key Design Decisions

### Repetition Definition
- **Current**: Exact combination match (milk + cereals = milk + cereals)
- **Not**: Ingredient-level tracking (had milk yesterday, can't have milk today)
- **Future**: Could evolve to building-block rotation logic

### Bread Variety
- Different bread types in same combination = different enough
- "Pão branco + butter" vs "Pão de forma + butter" = two different meals
- Bread type matters for variety

### Repository Model
- **Hybrid**: Store both ingredients and favorite combinations
- Allows flexibility: suggest known favorites + generate new experiments
- User can add combinations they discover and like

### Tracking Scope
- Track breakfast AND snacks together (they share ingredient space)
- Prevents same-day repetition across meal types
- Future: expand to lunch/dinner with different variety rules

---

## User Flow (V1)

### Initial Setup
1. User adds available ingredients to each category
2. Optionally adds favorite combinations
3. System is ready to suggest

### Daily Usage
**Scenario: "What should I have for breakfast?"**

1. User opens app, taps "Breakfast ideas"
2. System checks what was eaten recently (breakfast + snacks from past 2-3 days)
3. System generates 3-5 suggestions:
   - 2-3 from favorite combinations (if available)
   - 1-2 new experimental combinations
   - 1 AI variation suggestion
4. User reviews options, picks one
5. User confirms: "Having this for breakfast today"
6. System records the choice, won't suggest it again soon

**Scenario: "What should I have for mid-day snack?"**
- Same flow, but:
  - Filter out breakfast options used today
  - Emphasize fruit-based combinations
  - Avoid milk/yogurt options

### Adding New Favorites
- User tries an AI suggestion or random combo
- User likes it
- System prompts: "Add this to your favorites?"
- User confirms, now appears in regular rotation

---

## Technical Approach (High-Level)

### Platform
- Mobile app (phone-based usage)
- Internet required (not offline for V1)
- Simple, fast interface for morning decision-making

### Data Storage
- User's ingredient lists (by category)
- Favorite combinations
- Meal history (date, type, combination, ingredients)
- Preferences (if combination was liked/disliked)

### AI Integration
- Generate variation suggestions based on:
  - User's existing ingredients
  - Portuguese food culture context
  - Healthy breakfast patterns
  - Recent eating history (avoid suggesting variations of overused ingredients)

### Randomization Logic
- Not purely random - weighted by:
  - Favorites (higher weight)
  - Recent usage (lower weight for recently eaten)
  - Variety score (higher weight for ingredient combinations not used recently)
  - AI confidence (for AI suggestions)

---

## Success Metrics

How do we know this is working?

1. **Variety increase**: User cycles through more combinations per week
2. **Decision time reduction**: Time from "what should I eat?" to decision made
3. **Satisfaction**: User actually eats what was suggested (vs rejecting and regenerating)
4. **Repository growth**: User discovers and saves new favorite combinations
5. **Sustained usage**: User returns daily/regularly

---

## Open Questions for Future Exploration

### From Broader Meal Planning Concept

1. **Building block rotation**: How to apply "pasta → rice → potato" logic to other meals?
2. **Meal time variety rules**: Different repetition windows for breakfast vs lunch vs dinner
3. **Soup as a category**: How to handle soup in Portuguese meal structure?
4. **Leftovers tracking**: Should lunch leftovers count against variety?
5. **Healthy vs treat balance**: 80/20 split across all meals - how to enforce?
6. **Family preferences**: Multi-user support, different preferences per person
7. **Seasonal ingredients**: Soup in winter, salads in summer
8. **AI discovery**: Suggesting completely new meals vs variations

### For Breakfast/Snack Scope

1. **Ingredient pairing rules**: Are there combinations that don't make sense?
2. **Portuguese breakfast traditions**: Specific pairings that are culturally expected?
3. **Preparation methods**: Does "toasted vs fresh" matter enough to track?
4. **Portion awareness**: Should app suggest amounts or just combinations?
5. **Ingredient availability**: Track what's currently in the kitchen vs full repository?
6. **Time of day**: Different suggestions for early morning vs late morning breakfast?
7. **Weekend vs weekday**: Different patterns for rushed weekday vs leisurely weekend?

---

## Multi-Perspective Analysis

To ensure this idea is truly viable and well-designed, let's explore it through different expert lenses:

### 1. Idealist/Inventor Perspective

**The Big Vision: Beyond Just Breakfast Randomization**

**What problem are we really solving?**

At its core, this isn't about "random breakfast ideas" - it's about **decision fatigue elimination** and **cognitive load reduction** for daily recurring choices. Every family faces this:
- "What's for dinner?" asked every single day
- The mental burden of variety enforcement ("didn't we just have pasta?")
- The guilt of falling into repetitive patterns
- The effort required to remember what was eaten when

**The innovation insight:**

Most meal planning apps focus on recipes, grocery lists, and nutrition tracking. They're **planning tools** that add complexity. This is a **decision tool** that removes complexity.

**Wild possibilities (future vision):**

1. **Full Meal Intelligence System**
   - Extends beyond breakfast to lunch, dinner, snacks
   - Learns family preferences over time
   - Integrates with kitchen inventory (what's actually available)
   - Seasonal and cultural awareness (soup in winter, lighter meals in summer)

2. **Family Food Culture Preservation**
   - Captures traditional family recipes and meal patterns
   - Passes down "how we eat" to next generation
   - Respects cultural food traditions while encouraging healthy variety

3. **Health & Nutrition Layer**
   - Tracks macro/micro nutrient patterns over time
   - Suggests meals to balance nutrition needs
   - Helps families move toward healthier eating without strict rules

4. **Collaborative Family Tool**
   - Kids can suggest meals they want to try
   - Parents can approve/veto suggestions
   - Shared family food repository that grows over time

5. **AI as a Culinary Advisor**
   - "You've been eating heavy carbs all week, how about lighter options?"
   - "Based on what you liked, you might enjoy..."
   - "This ingredient is in season right now"

**What makes this exciting from an innovation standpoint?**

- **Respects human psychology**: Works with decision fatigue, not against it
- **Cultural sensitivity**: Portuguese food culture isn't "wrong" for not being American breakfast - it's different and valid
- **Scalable simplicity**: Starts incredibly simple (breakfast combos) but has clear path to sophistication
- **Personal + Universal**: Solves a very personal problem (your family's eating patterns) but is universally relatable
- **Learning opportunity**: Combination generation algorithms, variety enforcement logic, React Native mobile development

**The philosophical angle:**

Food is deeply personal and cultural. Generic meal planning apps treat food as fuel or data. This treats food as **family culture** - something to be preserved, enjoyed, and varied within familiar bounds.

---

### 2. Product Designer Perspective

**Understanding the User & Context**

**Primary User:** You (parent, meal decision-maker)
**Secondary Users:** Family members who will eat the meals

**User Context:**
- **When:** Morning decision moment - "What should I have for breakfast?"
- **Where:** Kitchen, bedroom (on phone), before leaving for work/school
- **Emotional state:** Rushed, decision-fatigued, hungry, possibly stressed
- **Goal:** Make a quick decision that feels good (variety, health, taste)

**Key User Insights:**

1. **Time is critical** - This isn't a browsing experience, it's a decision-making tool
2. **Decision paralysis is real** - Too many options = no decision. 3-5 suggestions is the sweet spot
3. **Memory is unreliable** - "What did I have yesterday?" shouldn't require thinking
4. **Variety matters but is invisible** - Users don't consciously track ingredient rotation; app must do it

**Core User Journey:**

```text
Morning Scenario: "What should I have for breakfast?"

1. Open app (from home screen)
   Emotion: Slightly stressed, need quick answer

2. Tap "Breakfast Ideas"
   Expectation: Show me options NOW

3. See 3-5 suggestions
   - Greek yogurt + pão de forma + jam
   - Milk + cereals
   - Pão branco + butter + cheese
   Emotion: Relief - "I can pick one of these"
   Decision: "I'll have yogurt and toast today"

4. Tap selection → Confirm
   Feeling: Satisfied decision made, move on with day

Total time: 10-20 seconds
```

**Key Screens & Interactions:**

**Screen 1: Home/Dashboard**
```
┌─────────────────────────────┐
│  Meals Randomizer     ☰     │
├─────────────────────────────┤
│                             │
│   [Breakfast Ideas]         │
│   [Snack Ideas]             │
│                             │
│  Recent Meals:              │
│  ✓ Greek yogurt + toast     │
│     (Today, breakfast)      │
│  ✓ Apple + pão mistura      │
│     (Today, snack)          │
│  ✓ Milk + cereals           │
│     (Yesterday, breakfast)  │
│                             │
└─────────────────────────────┘
```

**Screen 2: Suggestions (Breakfast)**
```
┌─────────────────────────────┐
│  ← Breakfast Ideas          │
├─────────────────────────────┤
│  Pick one:                  │
│                             │
│  ┌─────────────────────────┐│
│  │ Greek yogurt            ││
│  │ + Pão de forma          ││
│  │ + Jam                   ││
│  │        [Select]         ││
│  └─────────────────────────┘│
│                             │
│  ┌─────────────────────────┐│
│  │ Milk                    ││
│  │ + Cereals               ││
│  │        [Select]         ││
│  └─────────────────────────┘│
│                             │
│  ┌─────────────────────────┐│
│  │ Pão branco              ││
│  │ + Butter                ││
│  │ + Cheese                ││
│  │        [Select]         ││
│  └─────────────────────────┘│
│                             │
│  [Generate New Ideas]       │
└─────────────────────────────┘
```

**Screen 3: Confirmation**
```
┌─────────────────────────────┐
│  ✓ Breakfast Logged         │
├─────────────────────────────┤
│                             │
│  Greek yogurt               │
│  + Pão de forma             │
│  + Jam                      │
│                             │
│  Enjoy your meal!           │
│                             │
│  [Done]                     │
│                             │
└─────────────────────────────┘
```

**UX Challenges & Solutions:**

**Challenge 1: Empty State (First Use)**
- Problem: No ingredients = no suggestions
- Solution: Onboarding flow prompts ingredient setup
  - "Let's set up your breakfast ingredients"
  - Pre-populated common items with ability to add/remove
  - Quick setup: < 2 minutes

**Challenge 2: All Suggestions Feel Wrong**
- Problem: User doesn't want any of the 3-5 shown options
- Solution: "Generate New Ideas" button
  - Regenerates with different combinations
  - Tracks rejections (learn what user doesn't like)

**Challenge 3: Remembering to Log**
- Problem: User picks breakfast but forgets to confirm in app
- Solution: Low friction confirmation
  - Single tap to confirm
  - Option to confirm without opening app (notification?)
  - Grace period: Can log retroactively

**Challenge 4: Variety Visibility**
- Problem: User doesn't see how variety is enforced
- Solution: Subtle visual cues
  - "New!" badge on combinations not tried recently
  - Color coding: Green = haven't had in 3+ days, Yellow = had recently
  - Optional: "Variety score" showing weekly diversity

**Delightful Details:**

1. **Visual Ingredient Cards**
   - Each ingredient shows as a small visual card (not just text)
   - Bread types show different bread shapes/icons
   - Makes combinations feel tangible

2. **Haptic Feedback**
   - Gentle vibration on selection
   - Satisfying confirmation tap

3. **Smooth Animations**
   - Cards slide in when suggestions load
   - Check mark animation on confirmation
   - Makes the experience feel polished

4. **Personalization Over Time**
   - "You've tried 15 different breakfast combinations this month!"
   - "Your most common breakfast is milk + cereals"
   - Gentle encouragement without guilt

**Accessibility Considerations:**

- Large touch targets (minimum 44x44pt)
- High contrast text
- Readable font sizes (min 16pt body text)
- VoiceOver/TalkBack support for screen readers
- Works in portrait and landscape
- One-handed usability

---

### 3. Software Developer Perspective

**Technical Architecture for React Native**

**Why React Native Makes Sense Here:**

- Cross-platform (iOS + Android from one codebase)
- Native feel and performance
- Good learning opportunity (aligns with your goals)
- Rich ecosystem for mobile features
- Can add AI integration easily

**High-Level Architecture:**

```
┌─────────────────────────────────────┐
│     React Native App (UI Layer)     │
├─────────────────────────────────────┤
│   State Management (Context/Zustand)│
├─────────────────────────────────────┤
│       Business Logic Layer          │
│  - Combination Generator            │
│  - Variety Enforcement Engine       │
│  - Meal History Tracker             │
├─────────────────────────────────────┤
│       Data Layer (SQLite)           │
│  - Ingredients Repository           │
│  - Meal History                     │
│  - User Preferences                 │
├─────────────────────────────────────┤
│       AI Integration (Optional)     │
│  - Anthropic Claude API             │
│  - Variation Generator              │
└─────────────────────────────────────┘
```

**Data Model:**

```typescript
// Ingredients
interface Ingredient {
  id: string;
  name: string;
  category: 'protein' | 'carb' | 'sweet' | 'fruit';
  mealTypes: ('breakfast' | 'snack')[];
  createdAt: Date;
}

// Example:
{
  id: "uuid-1",
  name: "Greek yogurt",
  category: "protein",
  mealTypes: ["breakfast"]
}

// Combinations (Optional favorites)
interface Combination {
  id: string;
  name?: string; // Optional friendly name
  ingredients: string[]; // Array of ingredient IDs
  mealTypes: ('breakfast' | 'snack')[];
  isFavorite: boolean;
  createdAt: Date;
}

// Example:
{
  id: "combo-1",
  name: "My usual yogurt breakfast",
  ingredients: ["uuid-1", "uuid-5", "uuid-8"], // yogurt, pão, jam
  mealTypes: ["breakfast"],
  isFavorite: true
}

// Meal Log
interface MealLog {
  id: string;
  date: Date;
  mealType: 'breakfast' | 'snack';
  combinationId?: string; // If from saved combination
  ingredients: string[]; // Ingredient IDs
}

// Example:
{
  id: "log-123",
  date: "2025-11-03T08:30:00",
  mealType: "breakfast",
  ingredients: ["uuid-1", "uuid-5", "uuid-8"]
}

// User Preferences
interface Preferences {
  cooldownDays: number; // Default: 3 days
  suggestionsCount: number; // Default: 3-5
  aiSuggestionsEnabled: boolean;
}
```

**Core Algorithms:**

**1. Combination Generator**

```typescript
function generateSuggestions(
  mealType: 'breakfast' | 'snack',
  count: number = 4
): Combination[] {
  // 1. Get available ingredients for meal type
  const availableIngredients = getIngredientsForMealType(mealType);

  // 2. Get recent meal history (last 3 days)
  const recentMeals = getMealHistory(days: 3);

  // 3. Filter out recently used exact combinations
  const recentCombinations = recentMeals.map(m => m.ingredients.sort().join(','));

  // 4. Generate possible combinations
  const candidates = [];

  // 4a. Include favorite combinations (if not used recently)
  const favorites = getFavoriteCombinations(mealType)
    .filter(fav => !isRecentlyUsed(fav, recentCombinations));
  candidates.push(...favorites);

  // 4b. Generate random combinations (1-3 ingredients)
  for (let i = 0; i < count * 3; i++) {
    const combo = generateRandomCombination(availableIngredients, 1, 3);
    const comboKey = combo.sort().join(',');

    // Skip if recently used
    if (!recentCombinations.includes(comboKey)) {
      candidates.push({ ingredients: combo });
    }
  }

  // 5. Score each candidate based on variety
  const scored = candidates.map(candidate => ({
    ...candidate,
    varietyScore: calculateVarietyScore(candidate, recentMeals)
  }));

  // 6. Sort by variety score (higher = more varied)
  scored.sort((a, b) => b.varietyScore - a.varietyScore);

  // 7. Return top N
  return scored.slice(0, count);
}
```

**2. Variety Scoring**

```typescript
function calculateVarietyScore(
  candidate: Combination,
  recentMeals: MealLog[]
): number {
  let score = 100; // Start with perfect score

  // For each ingredient in the candidate
  for (const ingredientId of candidate.ingredients) {
    // Check how recently this ingredient was used
    const lastUsed = findLastUsedDate(ingredientId, recentMeals);

    if (lastUsed) {
      const daysAgo = daysSince(lastUsed);

      // Penalize ingredients used recently
      if (daysAgo === 0) score -= 50; // Used today = big penalty
      else if (daysAgo === 1) score -= 30; // Yesterday = medium penalty
      else if (daysAgo === 2) score -= 15; // 2 days ago = small penalty
      // 3+ days ago = no penalty
    } else {
      // Never used = bonus!
      score += 10;
    }
  }

  return Math.max(0, score); // Don't go negative
}
```

**3. Random Combination Generator**

```typescript
function generateRandomCombination(
  ingredients: Ingredient[],
  minCount: number,
  maxCount: number
): string[] {
  // Decide how many ingredients (1-3)
  const count = randomInt(minCount, maxCount);

  // Randomly select ingredients
  const shuffled = shuffle(ingredients);
  const selected = shuffled.slice(0, count);

  return selected.map(ing => ing.id);
}
```

**Tech Stack Details:**

**Core:**
- React Native 0.73+
- TypeScript (type safety for data models)
- React Navigation (screen navigation)

**State Management:**
- Zustand (lightweight, simpler than Redux)
- OR React Context (if keeping it minimal)

**Database:**
- expo-sqlite or react-native-sqlite-storage
- Local SQLite database on device
- No backend needed for V1

**AI Integration (Optional V1, likely V2):**
- Anthropic Claude API for variation suggestions
- Direct HTTP calls from device
- API key stored securely in device keychain

**UI Components:**
- React Native built-in components (View, Text, TouchableOpacity, FlatList)
- Custom combination card components
- Simple, clean design (no heavy UI library needed)

**Interesting Technical Challenges:**

**Challenge 1: Combination Generation Quality**

How do we ensure generated combinations make sense?

**V1 Solution:** Trust randomness, let user reject bad combos
- If user sees "milk + banana + jam" and thinks "weird," they skip it
- Track rejections to learn bad patterns

**V2 Solution:** Pairing rules
```typescript
interface IngredientPairingRules {
  requiredPairings?: string[]; // "milk" requires "cereals" or "cookies"
  avoidPairings?: string[]; // "butter" avoid "yogurt"
}
```

**Challenge 2: Performance (Combination Generation Speed)**

Generating many combinations and scoring them could be slow.

**Solution:**
- Pre-compute possible combinations when ingredients change
- Cache variety scores
- Use memoization for expensive calculations
- Should still be < 100ms on mobile

**Challenge 3: Data Migration**

As the app evolves, data schema will change.

**Solution:**
- Version database schema
- Write migration scripts for each version
- Test migrations on sample data

**Challenge 4: AI API Calls from Mobile**

Calling Claude API directly from device exposes API key in app.

**V1 Solution:** Accept the risk (personal use only)
- Store API key in secure keychain
- Only you use the app

**V2 Solution (if expanding):** Backend proxy
- Mobile app → Your backend → Claude API
- Backend protects API key
- Adds complexity but more secure

**What Makes This Interesting for Learning React Native:**

1. **State management patterns** - Managing ingredients, history, preferences
2. **Local data persistence** - SQLite integration
3. **List rendering optimization** - FlatList for suggestions
4. **Form handling** - Adding ingredients, confirming meals
5. **Navigation patterns** - Stack navigation between screens
6. **Algorithm implementation** - Combination generation, variety scoring
7. **Future: API integration** - HTTP calls to Claude for AI suggestions
8. **Future: Animations** - Smooth transitions, card flips

**Project Structure:**

```
/meals-randomizer/
├── src/
│   ├── components/
│   │   ├── CombinationCard.tsx
│   │   ├── IngredientBadge.tsx
│   │   └── MealHistoryItem.tsx
│   ├── screens/
│   │   ├── HomeScreen.tsx
│   │   ├── SuggestionsScreen.tsx
│   │   ├── HistoryScreen.tsx
│   │   └── SettingsScreen.tsx
│   ├── services/
│   │   ├── database.ts (SQLite setup)
│   │   ├── combinationGenerator.ts
│   │   ├── varietyEngine.ts
│   │   └── aiService.ts (optional)
│   ├── store/
│   │   └── useStore.ts (Zustand or Context)
│   ├── types/
│   │   └── index.ts (TypeScript types)
│   └── App.tsx
├── package.json
└── README.md
```

---

### 4. Salesman/Market Validator Perspective

**Who Would Actually Use This?**

**Target Market Analysis:**

**Primary Market:** Families with decision fatigue around daily meals
- Parents (especially meal planners)
- Typically one person responsible for food decisions
- Want variety but don't have time/energy to think about it
- Value health but not obsessively

**Secondary Market:**
- Single people who eat similar breakfasts/snacks
- Couples sharing meal decisions
- Anyone with "what should I eat?" paralysis

**Market Size:**
- Narrow initially (personal/family use)
- Potentially broader (meal planning app market is huge)

**Similar Solutions Research:**

**1. Meal Planning Apps (Mealime, Paprika, Plan to Eat)**
- Focus: Recipe discovery, grocery lists, weekly planning
- Weakness: Too complex, require upfront effort, recipe-centric
- Gap: Don't solve "quick breakfast decision" problem

**2. Recipe Apps (Yummly, Tasty, AllRecipes)**
- Focus: Finding and saving recipes
- Weakness: Browsing doesn't reduce decision fatigue, adds to it
- Gap: No variety enforcement, no cultural customization

**3. Nutrition Trackers (MyFitnessPal, Cronometer)**
- Focus: Calorie/macro tracking
- Weakness: Feels like homework, doesn't suggest meals
- Gap: Data entry burden, not decision-making aid

**4. AI Chatbots (ChatGPT, Claude directly)**
- Focus: General assistance, can generate meal ideas
- Weakness: No persistence, no variety tracking, repetitive prompting needed
- Gap: Not purpose-built, no memory of what you ate

**5. Random Meal Generators (web apps, basic randomizers)**
- Focus: "Spin the wheel" for dinner ideas
- Weakness: Generic, not personalized, no tracking
- Gap: Don't learn your preferences or culture

**What This App Does Better:**

| Feature | Meals Randomizer | Existing Solutions |
|---------|-----------------|-------------------|
| Quick decision-making | ✓ 3-5 options instantly | Recipe browsing takes time |
| Variety enforcement | ✓ Tracks history, prevents repetition | User must remember manually |
| Cultural customization | ✓ Portuguese ingredients | Generic recipes |
| Low complexity | ✓ Just ingredients, no recipes | Recipe details overwhelming |
| Personal repository | ✓ Your ingredients, your combos | Generic databases |
| No meal prep required | ✓ Simple combinations | Recipes require cooking |

**Value Proposition:**

**For You (Creator):**
- Solves a real daily problem
- Learning opportunity (React Native)
- Personal tool tailored to your exact needs
- Potential to expand if successful

**For Users (if expanded beyond personal use):**
- Reduces decision fatigue every morning
- Increases breakfast variety without effort
- Respects cultural food traditions
- Free (or low-cost if monetized)

**Portuguese Market Considerations:**

**Cultural Fit:**
- Portuguese breakfast culture is distinct (milk + bread, not bacon + eggs)
- Generic meal apps don't respect this
- Opportunity for culturally-specific app (Portuguese breakfast randomizer)

**Market Opportunity (Portugal-specific):**
- Portuguese population: ~10M
- Smartphone penetration: ~80%
- Potential market: Families looking for breakfast variety
- Competition: Likely none specifically for Portuguese breakfast

**International Market:**
- Same logic applies to other cultures (Italian breakfast, Japanese breakfast, etc.)
- Could become "cultural breakfast randomizer" with locale options

**Monetization Potential (if expanding beyond personal):**

**Option 1: Freemium**
- Free: Basic combination generation, limited history
- Paid ($2-5/month): AI suggestions, unlimited history, family profiles

**Option 2: One-Time Purchase**
- $5-10 one-time payment
- No subscription, all features unlocked

**Option 3: Free with Optional AI**
- Core app is free
- AI features require user's own API key (BYOK model)

**Option 4: Free Forever**
- Open-source, community-driven
- No monetization, just a useful tool

**Realistic Assessment:**

**Likelihood of Broad Success:**
- Medium to Low for mass market (niche problem)
- High for personal/family use (solves YOUR problem)
- Medium for Portuguese community (culturally relevant)

**Why it might not go viral:**
- Solves a "nice to have" not a "must have"
- Breakfast is personal, hard to generalize
- Low social sharing potential (not flashy)

**Why it could work well:**
- Genuine utility for target users
- Low competition in cultural meal planning
- Could grow organically via word-of-mouth
- Extensible to full meal planning if breakfast succeeds

**Recommendation:**

**Phase 1: Build for yourself**
- Don't worry about monetization
- Solve YOUR problem first
- Learn React Native in the process

**Phase 2: Share with Portuguese community**
- If it works for you, share locally
- Get feedback from friends/family
- Iterate based on real usage

**Phase 3: Decide on expansion**
- If people love it, consider broader release
- Could stay free, or monetize modestly
- Could expand to lunch/dinner/full meals

**Key Insight:**

This isn't a venture-scale business idea, but it's a **perfectly sized personal tool** that could become a community utility. Think of it as:
- 80% learning project (React Native, mobile development)
- 20% practical tool (actually useful daily)
- 5% potential business (if it resonates beyond you)

---

## Synthesis: Aligned Vision Across Perspectives

**What All Perspectives Agree On:**

1. **Start with breakfast/snacks only** - Simple, focused, achievable
2. **React Native is the right choice** - Learning opportunity + practical cross-platform solution
3. **Combination generation is core** - Not recipes, just ingredient pairings
4. **Variety enforcement is the key value** - Prevents repetition automatically
5. **Quick decision-making is critical** - 10-20 seconds from open to decision
6. **Portuguese food culture matters** - Not generic, culturally specific
7. **Personal tool first** - Build for yourself, expand if successful

**Key Tensions & Resolutions:**

**Tension 1: Simplicity vs Features**
- Idealist wants: AI, nutrition tracking, family profiles
- Designer wants: Minimal friction, fast UX
- Developer wants: Manageable scope
- **Resolution:** V1 is simple (just combinations + tracking), features are V2+

**Tension 2: Randomness vs Intelligence**
- Designer wants: Smart suggestions that make sense
- Developer notes: Smart pairing rules are complex
- **Resolution:** V1 trusts randomness + user rejections, V2 adds pairing rules

**Tension 3: Personal Tool vs Product**
- Salesman sees: Limited market appeal
- Idealist sees: Potential for broader impact
- **Resolution:** Build for personal use, open to expansion later

**Tension 4: Learning Goals vs Shipping Fast**
- Developer wants: Learn React Native deeply
- PM wants: Ship in 1 week to validate
- **Resolution:** 1 week is unrealistic for learning React Native from scratch
  - **Revised timeline:** 2-3 weeks (including learning curve)

---

## Updated V1 Specification (Distilled Simple Version)

**Product:** Breakfast & Snack Randomizer

**Platform:** React Native (Expo for faster setup)

**Timeline:** 2-3 weeks (accounting for React Native learning)

### Core Features (V1)

1. **Ingredient Repository**
   - Pre-populated with Portuguese breakfast items
   - User can add/remove/edit ingredients
   - Categorized (protein, carb, sweet, fruit)

2. **Meal Type Selection**
   - Two buttons: "Breakfast Ideas" | "Snack Ideas"

3. **Combination Generation**
   - Shows 4 suggestions
   - Random combinations (1-3 ingredients each)
   - Weighted by variety score (avoid recent repetition)

4. **Meal Logging**
   - User taps a suggestion to select
   - Confirms with single tap
   - Stored in local SQLite database

5. **History View**
   - Shows recent meals (last 7 days)
   - Grouped by date and meal type

6. **Simple Settings**
   - Adjust cooldown period (default: 3 days)
   - Adjust number of suggestions (default: 4)

### What's NOT in V1

- ❌ AI suggestions (pure randomization + variety scoring)
- ❌ Pairing rules (any combination is valid)
- ❌ Nutrition tracking
- ❌ Multi-user profiles
- ❌ Cloud sync
- ❌ Favorite combinations (all combos treated equally)
- ❌ Preparation details (toast vs fresh)

### Tech Stack (Final)

- **React Native** (via Expo for easier setup)
- **TypeScript** (type safety)
- **Expo SQLite** (local database)
- **Zustand** (lightweight state management)
- **React Navigation** (screen navigation)

### Data Schema (Simplified)

```sql
-- Ingredients table
CREATE TABLE ingredients (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  meal_type TEXT NOT NULL
);

-- Meal logs table
CREATE TABLE meal_logs (
  id TEXT PRIMARY KEY,
  date TEXT NOT NULL,
  meal_type TEXT NOT NULL,
  ingredients TEXT NOT NULL -- JSON array of ingredient IDs
);

-- Preferences table
CREATE TABLE preferences (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL
);
```

### User Flow (Final)

```
1. Home Screen
   ├─> [Breakfast Ideas]
   ├─> [Snack Ideas]
   └─> Recent Meals (last 7 days)

2. Suggestions Screen
   ├─> Shows 4 combination cards
   ├─> User taps one → Confirmation modal
   └─> [Generate New Ideas] button

3. Confirmation Modal
   ├─> "Log this meal?"
   ├─> [Yes] → Saves to database → Back to Home
   └─> [No] → Back to suggestions

4. Settings Screen (optional)
   ├─> Cooldown days slider
   ├─> Suggestions count slider
   └─> Manage ingredients (add/remove)
```

### Success Criteria

**Week 2-3 (Build Phase):**
- ✓ App runs on iOS and Android (via Expo Go)
- ✓ Can generate 4 breakfast suggestions
- ✓ Can log a meal
- ✓ Can view history
- ✓ Variety enforcement works (doesn't suggest same combo within 3 days)

**Week 4-5 (Validation Phase):**
- ✓ You use it every day for breakfast decisions
- ✓ Suggestions feel varied and useful
- ✓ Saves time vs thinking manually
- ✓ No bugs or crashes

**Week 6 (Decision Point):**
- **Success:** Using it daily, finding it helpful → Plan V2 (AI, pairing rules, lunch/dinner)
- **Partial:** Works but needs UX tweaks → Iterate on V1
- **Failure:** Not using it → Learn why, pivot or shelve

### Build Timeline (Revised)

**Week 1: Setup + Learning**
- Day 1-2: React Native basics, Expo setup
- Day 3-4: SQLite integration, data models
- Day 5-7: Basic UI screens (Home, Suggestions)

**Week 2: Core Features**
- Day 8-10: Combination generation algorithm
- Day 11-12: Variety scoring and filtering
- Day 13-14: Meal logging and history

**Week 3: Polish + Deploy**
- Day 15-17: Settings screen, ingredient management
- Day 18-19: UI polish, error handling
- Day 20-21: Testing on real devices, bug fixes

### Next Steps

1. **Research existing solutions** (validate the gap)
2. **Set up React Native development environment**
3. **Create new Expo project**
4. **Prototype combination generation algorithm** (test on paper first)
5. **Build V1 following this spec**

---

## Final Thoughts

**Why This Idea Has Potential:**

**From Idealist:**
- Solves a real, daily problem (decision fatigue)
- Respects cultural food traditions
- Scalable to broader meal planning vision

**From Designer:**
- Simple, focused user experience
- Fast decision-making (< 20 seconds)
- Delightful micro-interactions possible

**From Developer:**
- Great learning opportunity (React Native, algorithms, mobile data)
- Interesting technical challenges (combination generation, variety scoring)
- Clean architecture, extensible for future features

**From Salesman:**
- Fills a gap (no cultural breakfast randomizers exist)
- Personal use case is strong (you'll actually use it)
- Low risk (personal project, not business)
- Potential for community traction if shared

**The Honest Assessment:**

This is **not a startup idea**, but it **is a great personal tool** that could become useful for others. It's:
- 70% learning project (React Native skills)
- 25% practical utility (daily use)
- 5% potential side project (if others want it)

**Most importantly:** It solves YOUR problem, which is the best validation.

---

## Next Steps

### To Validate This Idea

1. **Research existing solutions**:
   - What meal planning apps exist?
   - Do any handle ingredient-combination generation?
   - What do they do well/poorly?
   - Is there a gap this fills?

2. **Prototype the combination logic**:
   - Can we generate interesting combinations from simple rules?
   - How many unique combinations are possible from the ingredient set?
   - Do they feel useful or silly?

3. **Test variety enforcement**:
   - What's the right "cooldown period" for breakfast combinations?
   - 2 days? 3 days? A week?
   - Does it vary by how much you liked it?

4. **Design the core UI**:
   - What does the "show 4 options" screen look like?
   - How does tracking "I'm having this" work?
   - How easy is it to add new ingredients?

5. **Learn React Native basics**:
   - Complete React Native tutorial
   - Understand Expo workflow
   - Practice with SQLite integration

### To Expand Beyond Breakfast

Once breakfast/snack generator is validated:

1. Apply same model to lunch/dinner with more complex rules
2. Add building-block rotation logic
3. Handle multi-component meals (soup + main + side)
4. Track healthy/treat balance
5. Consider family/multi-user scenarios

---

## Next Steps

### To Validate This Idea

1. **Research existing solutions**:
   - What meal planning apps exist?
   - Do any handle ingredient-combination generation?
   - What do they do well/poorly?
   - Is there a gap this fills?

2. **Prototype the combination logic**:
   - Can we generate interesting combinations from simple rules?
   - How many unique combinations are possible from the ingredient set?
   - Do they feel useful or silly?

3. **Test variety enforcement**:
   - What's the right "cooldown period" for breakfast combinations?
   - 2 days? 3 days? A week?
   - Does it vary by how much you liked it?

4. **Design the AI variation prompt**:
   - What context does AI need to suggest good variations?
   - How to keep suggestions culturally appropriate?
   - How to balance familiar vs experimental?

5. **Sketch the UI**:
   - What does the "show 3-5 options" screen look like?
   - How does tracking "I'm having this" work?
   - How easy is it to add new ingredients/combinations?

### To Expand Beyond Breakfast

Once breakfast/snack generator is validated:

1. Apply same model to lunch/dinner with more complex rules
2. Add building-block rotation logic
3. Handle multi-component meals (soup + main + side)
4. Track healthy/treat balance
5. Consider family/multi-user scenarios

---

## Distilled Simple Version (1 Week Implementation)

**Absolute minimal version to test the concept:**

### Features
1. **Ingredient lists**: 4 simple category lists (protein, carb, sweet, fruit)
2. **Manual combination builder**: User creates a few favorite combos to start
3. **Random suggestion**: Show 3 random combinations (no AI yet)
4. **Simple tracking**: Mark "had this today" - won't show again for 3 days
5. **Basic UI**: One screen with "Breakfast ideas" and "Snack ideas" buttons

### What's NOT in V1
- No AI suggestions (just random from repository)
- No complex variety logic (just "don't repeat for 3 days")
- No favorite/rating system (all combos equal weight)
- No preparation details (just ingredient names)
- No multi-day planning (just "what should I eat right now?")

### Technical Stack (Suggested)
- Simple mobile web app (PWA) or React Native
- Local storage for ingredient lists and history
- No backend needed initially
- Can add AI API calls later

### Success Criteria
- Can generate 10+ unique breakfast combinations
- User actually uses it for 1 week straight
- User finds at least 1-2 new combinations they like
- Decision time reduced (subjective user feedback)

**Estimated effort: ~1 week of focused work**

---

## Approach 2: Family Kitchen (Collaborative Meal Sharing)

*Note: The content above represents "Approach 1" - the individual meal randomizer. This section explores expanding to family/household collaboration.*

### 2.1 Vision: Beyond Individual → Family Coordination

**The expanded problem:**
- Individual: "What should I have for breakfast?" ✅ (Approach 1 solves this)
- Family: "What should WE have for dinner?" 🆕
- Coordination: "Who's cooking tonight? What ingredients do we have?"

**Core insight:** Families don't just need individual variety - they need:
1. **Shared visibility** - what did everyone eat today?
2. **Coordinated planning** - "let's have tacos tomorrow"
3. **Collective favorites** - meals the whole family loves
4. **Resource awareness** - ingredient inventory at home

**Target use case:** Households sharing a kitchen (families, couples, roommates)

---

### 2.2 Family Structure & Roles

**Connection Methods (all supported):**

| Method | Use Case | Flow |
|--------|----------|------|
| QR Code | In-person pairing | Admin shows QR → member scans → joined |
| Invite Link | Remote family | Admin shares link → member clicks → joined |
| Family Code | Simple sharing | Admin reads code → member enters → joined |

**Roles:**
- **Admin (1-2 per family)**: Can invite/remove members, manage family settings
- **Member**: Can contribute meals, vote on proposals, see shared data

**Multi-family Support:**
- User can belong to multiple families (e.g., household + extended family group)
- Each family has separate meal logs and preferences
- User switches context in app (family selector)

---

### 2.3 What Gets Shared

| Data Type | Individual | Family Shared |
|-----------|------------|---------------|
| Meal logs | "I had X" (private optional) | "Family member Y had Z" |
| Ingredients | My personal inventory | Shared kitchen inventory |
| Favorites | My starred meals | Family starred meals |
| Proposals | - | "Let's have this tomorrow" + voting |
| History | My history | Family meal timeline |

**Privacy Controls:**
- Each meal can be: `personal` (only me) or `family` (shared)
- Default visibility configurable per user
- Personal meals don't appear in family history

---

### 2.4 Technical Architecture: "Pear Lite" Hybrid

Based on decentralization research (Saberloop patterns), adapted for React Native's capabilities:

```
┌─────────────────────────────────────────────────────────────┐
│                    FAMILY MEMBER DEVICES                     │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐    │
│  │ Device A │  │ Device B │  │ Device C │  │ Device D │    │
│  │ (Admin)  │  │ (Member) │  │ (Member) │  │ (Admin)  │    │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └────┬─────┘    │
│       │             │             │             │           │
│       └─────────────┴──────┬──────┴─────────────┘           │
│                            │                                 │
│              ┌─────────────▼─────────────┐                  │
│              │   P2P SYNC (WebRTC)       │                  │
│              │   - Direct device-to-device│                  │
│              │   - Works on same network  │                  │
│              │   - No server needed       │                  │
│              └─────────────┬─────────────┘                  │
│                            │                                 │
│                   (if P2P fails)                            │
│                            │                                 │
│              ┌─────────────▼─────────────┐                  │
│              │   HTTP FALLBACK (VPS)     │                  │
│              │   - Small coordination     │                  │
│              │   - Stores encrypted blobs │                  │
│              │   - Discovery & signaling  │                  │
│              └───────────────────────────┘                  │
└─────────────────────────────────────────────────────────────┘
```

**Key Principles:**

1. **Local-first**: All data lives in device SQLite, sync is secondary
2. **P2P preferred**: Try direct sync between family devices first
3. **HTTP fallback**: Small VPS for when P2P unavailable (devices offline)
4. **Sync on demand**: Not always-on; sync when app opens or user requests
5. **Digital signatures**: Admin signs family data for trust verification

---

### 2.5 React Native Advantages over PWA

| Capability | PWA | React Native (SaborSpin) |
|------------|-----|--------------------------|
| Background sync | Limited by browser | Native background fetch |
| Push notifications | Web Push (limited) | Native push (full control) |
| P2P connections | WebRTC only | WebRTC + native libraries |
| Crypto operations | WebCrypto | Native crypto (faster) |
| Offline storage | IndexedDB (limited) | SQLite (unlimited) |
| App lifecycle | Tab must be open | Runs in background |

**React Native libraries to consider:**
- `react-native-webrtc` - P2P connections
- `expo-crypto` - Already using for UUIDs, can do signatures
- `@react-native-async-storage/async-storage` - Already using for queue
- `expo-background-fetch` - Periodic sync
- `expo-notifications` - Push for proposals

---

### 2.6 Data Model Extensions

**Existing infrastructure we can leverage:**
- SQLite with cross-platform adapter pattern ✅
- UUID-based IDs (no conflicts in distributed systems) ✅
- Zustand state management (async-ready) ✅
- Timestamps on all records (conflict detection) ✅
- AsyncStorage integration ✅
- TypeScript for safe data transformations ✅

**Gaps to fill:**
- No user/account system
- No network layer (HTTP client)
- No multi-device sync
- No conflict resolution
- No data ownership model

**New tables needed:**

```sql
-- User identity (local device)
CREATE TABLE users (
  id TEXT PRIMARY KEY,           -- UUID
  display_name TEXT,
  public_key TEXT,               -- For signature verification
  private_key_encrypted TEXT,    -- Encrypted, stays on device
  created_at TEXT
);

-- Families
CREATE TABLE families (
  id TEXT PRIMARY KEY,           -- Content-addressed hash
  name TEXT,
  created_by TEXT,               -- user_id
  invite_code TEXT,              -- For joining
  created_at TEXT
);

-- Family membership
CREATE TABLE family_members (
  family_id TEXT,
  user_id TEXT,
  role TEXT,                     -- 'admin' | 'member'
  joined_at TEXT,
  PRIMARY KEY (family_id, user_id)
);

-- Extended meal_logs (add columns to existing table)
-- meal_logs (
--   ...existing columns...,
--   user_id TEXT,              -- Who logged this
--   family_id TEXT,            -- NULL = personal only
--   visibility TEXT,           -- 'personal' | 'family'
--   signature TEXT             -- Admin signature for family content
-- );

-- Meal proposals
CREATE TABLE meal_proposals (
  id TEXT PRIMARY KEY,
  family_id TEXT,
  proposed_by TEXT,              -- user_id
  meal_description TEXT,
  proposed_date TEXT,
  status TEXT,                   -- 'open' | 'accepted' | 'rejected'
  created_at TEXT
);

-- Votes on proposals
CREATE TABLE proposal_votes (
  proposal_id TEXT,
  user_id TEXT,
  vote TEXT,                     -- 'yes' | 'no'
  voted_at TEXT,
  PRIMARY KEY (proposal_id, user_id)
);

-- Sync tracking
CREATE TABLE sync_log (
  id TEXT PRIMARY KEY,
  family_id TEXT,
  last_sync_at TEXT,
  sync_type TEXT,                -- 'p2p' | 'http'
  records_synced INTEGER
);
```

---

### 2.7 User Flows

**Flow 1: Create Family**
1. User taps "Create Family"
2. Enters family name (e.g., "Silva Household")
3. App generates family ID, invite code, user becomes admin
4. Shows QR code + invite link + code for sharing

**Flow 2: Join Family**
1. User receives invite (QR/link/code)
2. Scans/clicks/enters → app validates
3. User added as member
4. Initial sync downloads family data

**Flow 3: Propose Meal**
1. User generates suggestions (existing flow)
2. Instead of logging, taps "Propose to Family"
3. Selects date, adds optional note
4. Family members get notification
5. Members vote yes/no
6. After threshold/time, proposal accepted or declined

**Flow 4: Log Family Meal**
1. User logs meal (existing flow)
2. Toggle: "Share with family?"
3. If yes, meal appears in family history
4. Other members see "[Name] had [meal] for [type]"

**Flow 5: Sync on App Open**
1. App opens, checks last sync time
2. If >5 min ago, attempts sync:
   - Try P2P first (discover family devices on network)
   - If P2P fails, fall back to HTTP server
3. Merge incoming changes (last-write-wins or conflict UI)
4. Push local changes to others

---

### 2.8 Server Components (VPS)

Minimal server role (could share VPS with telemetry):

| Endpoint | Purpose |
|----------|---------|
| `POST /families/register` | Store family metadata for discovery |
| `GET /families/{code}` | Look up family by invite code |
| `POST /sync/{family_id}` | Upload encrypted family data blob |
| `GET /sync/{family_id}` | Download family data blob |
| `POST /signal` | WebRTC signaling for P2P connection setup |

**Privacy note:** Server stores encrypted blobs only. Cannot read meal data.

---

### 2.9 Digital Signatures for Trust

Following decentralized curation patterns:

1. Family admin has a key pair (public/private)
2. When admin approves family content, they sign it
3. Other devices verify signature before accepting
4. Prevents tampering and fake family data

```javascript
// Signing (admin device)
const signature = await Crypto.sign(
  privateKey,
  JSON.stringify(mealLog)
);
mealLog.signature = signature;

// Verification (any device)
const isValid = await Crypto.verify(
  adminPublicKey,
  mealLog.signature,
  JSON.stringify(mealLog)
);
```

---

### 2.10 Implementation Phases (Future Reference)

**Phase A: User Identity & Families (Foundation)**
- Add user table and local identity
- Family creation and joining
- Basic family UI

**Phase B: Shared Meal Logs**
- Extend meal_logs with user_id, family_id, visibility
- Family meal history view
- Privacy toggle on logging

**Phase C: HTTP Sync**
- VPS endpoints for family sync
- Encrypted blob storage
- Sync on app open

**Phase D: P2P Sync**
- WebRTC integration
- Local network discovery
- P2P-first, HTTP-fallback logic

**Phase E: Proposals & Voting**
- Proposal creation flow
- Voting mechanism
- Push notifications

---

### 2.11 Key Design Decisions Summary

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Sync model | On-demand (not always-on) | Simpler, battery-friendly, sufficient for meal planning |
| Server role | Coordination only | Privacy-preserving, encrypted blobs, minimal infrastructure |
| Connection methods | QR + Link + Code | Cover all use cases (in-person, remote, simple) |
| Family structure | 1-2 admins + peers | Balance control with simplicity |
| Privacy | Per-meal visibility toggle | Respect individual autonomy within family context |
| Multi-family | Supported | Real-world need (household vs extended family) |

---

## Data Model Evolution: From Ingredients to Meals

### The Complexity Gap

**Current model (breakfast/snacks)** works with simple ingredient combinations:
- `milk + bread + jam`
- Ingredients ARE the meal
- No preparation method needed
- Easy to track variety at ingredient level

**Future model (lunch/dinner)** introduces complexity:
- `roasted potatoes + fried chicken` → ingredient + HOW it's cooked
- Often has a friendly name: "Mom's chicken"
- Sometimes unnamed: just described by components
- Preparation method affects variety (fried chicken ≠ grilled chicken)

### The Core Question

When someone logs "Mom's chicken", what are we actually tracking?
- The **name** (for display and family sharing)?
- The **components** (for variety enforcement)?
- Both?

### Modeling Approaches

#### Approach A: Add Preparation Method to Ingredients

Treat "fried chicken" as a single prepared ingredient.

```
prepared_ingredients (
  id TEXT PRIMARY KEY,
  base_ingredient TEXT,      -- "chicken"
  preparation_method TEXT,   -- "fried", "grilled", "roasted", "raw"
  display_name TEXT          -- "fried chicken"
)
```

**Meal = collection of prepared ingredients**

Example: `["fried chicken", "roasted potatoes", "salad (raw)"]`

| Pros | Cons |
|------|------|
| Simple extension of current model | Explosion of combinations (chicken × 5 prep methods = 5 entries) |
| Easy to implement | Harder to answer "when did I last have chicken?" (any prep) |
| Clear variety tracking | Ingredient list grows large |

---

#### Approach B: Two-Tier System (Ingredients + Dishes)

Separate ingredients from named dishes/recipes.

```
ingredients (
  id, name, category
)

preparation_methods (
  id, name   -- fried, grilled, roasted, boiled, raw, baked
)

dishes (
  id TEXT PRIMARY KEY,
  name TEXT,                 -- "Mom's chicken"
  description TEXT
)

dish_components (
  dish_id TEXT,
  ingredient_id TEXT,
  preparation_method_id TEXT,
  PRIMARY KEY (dish_id, ingredient_id)
)
```

**Meal = either a dish reference OR ad-hoc components**

| Pros | Cons |
|------|------|
| Clean separation of concerns | More complex to build and maintain |
| Named dishes are first-class | Two ways to log a meal (dish vs components) |
| Can query "all dishes with chicken" | Requires upfront dish creation |
| Good for family sharing ("Mom's chicken") | Overhead for simple meals |

---

#### Approach C: Flexible Meals (Recommended)

A meal has optional name + required components. Best of both worlds.

```
meals (
  id TEXT PRIMARY KEY,
  name TEXT NULL,            -- optional: "Mom's chicken"
  created_at TEXT
)

meal_components (
  meal_id TEXT,
  ingredient TEXT,           -- "chicken"
  preparation TEXT,          -- "fried"
  PRIMARY KEY (meal_id, ingredient, preparation)
)
```

**Example meal:**
```json
{
  "id": "meal-123",
  "name": "Mom's chicken",      // optional friendly name
  "components": [
    { "ingredient": "chicken", "preparation": "fried" },
    { "ingredient": "potatoes", "preparation": "roasted" },
    { "ingredient": "salad", "preparation": "raw" }
  ]
}
```

**Display logic:**
- If `name` exists → show "Mom's chicken"
- If `name` is null → show "fried chicken + roasted potatoes + salad"

**Variety tracking:**
- Track at **component level**: "haven't had fried chicken in 3 days"
- Can also track at **ingredient level**: "haven't had any chicken in 5 days"
- Display at **meal name level** when available for UX

| Pros | Cons |
|------|------|
| Flexible: works for breakfast AND dinner | Slightly more complex than Approach A |
| Optional naming reduces friction | Need good UX for "name this meal?" flow |
| Variety tracking at multiple levels | Components need consistent naming |
| Easy family sharing with meaningful names | - |
| Backward compatible with current model | - |

---

#### Approach D: Free Text Descriptions

Just use text descriptions, no structure.

```
meals (
  id TEXT PRIMARY KEY,
  description TEXT,   -- "Mom's chicken (fried chicken + roasted potatoes)"
  meal_type TEXT,
  logged_at TEXT
)
```

| Pros | Cons |
|------|------|
| Simplest to implement | Loses structure for variety tracking |
| Maximum flexibility | Can't query "when did I last have chicken?" |
| No data model changes needed | No ingredient-level analysis |
| Good for quick logging | Family sharing less meaningful |

---

### Recommendation: Approach C (Flexible Meals)

**Why Approach C is most interesting:**

1. **Scales naturally**: Works for simple breakfast (just components) AND complex dinner (named + components)

2. **Variety tracking at multiple levels**:
   - Component level: "fried chicken" vs "grilled chicken" are different
   - Ingredient level: "any chicken" for broader rotation
   - Meal level: "Mom's chicken" as a unit

3. **Family sharing benefits**:
   - Share "Mom's chicken" (meaningful name)
   - Others see what's actually in it (components)
   - Can propose meals by name OR by description

4. **Backward compatible**:
   - Current breakfast logging = meal with no name, just components
   - No migration needed, just enhancement

5. **Progressive complexity**:
   - V1: Log components only (current behavior)
   - V2: Add optional naming
   - V3: Suggest names based on common combinations

### Migration Path

**Phase 1 (Current):** Ingredients only
```
meal_logs: { ingredients: ["milk", "bread", "jam"] }
```

**Phase 2:** Add preparation method
```
meal_logs: {
  components: [
    { ingredient: "milk", preparation: null },
    { ingredient: "bread", preparation: "toasted" }
  ]
}
```

**Phase 3:** Add optional naming
```
meal_logs: {
  name: "Mom's chicken",  // optional
  components: [
    { ingredient: "chicken", preparation: "fried" },
    { ingredient: "potatoes", preparation: "roasted" }
  ]
}
```

### Design Decisions

| Question | Decision | Rationale |
|----------|----------|-----------|
| **Preparation method vocabulary** | Hybrid: predefined list + custom additions | Predefined ensures consistency for common methods (fried, grilled, roasted, boiled, baked, raw, steamed, sautéed), custom allows flexibility for edge cases |
| **When to prompt for naming** | Never auto-prompt (user-initiated only) | Least friction. User taps "name this meal" when they want. No interruptions |
| **Ingredient granularity** | Fine-grained (chicken breast ≠ chicken thigh) | More precise variety tracking. User controls how specific they want to be |
| **Preparation inheritance** | Strict - named meal must match exactly | "Mom's chicken" = fried chicken + roasted potatoes, always. If prep changes, log as different meal |
| **AI role in naming** | No AI for naming | Keep it simple. User names things themselves or leaves unnamed |

**Preparation methods (initial predefined list):**
- fried, grilled, roasted, boiled, baked, raw, steamed, sautéed, stewed, smoked, poached, braised

---

## Potential Enhancements (Post-V1)

Ideas from the original exploration that weren't in V1 scope but could be added to improve the experience.

### Low-Hanging Fruit

#### 1. Favorite Combinations
Mark certain combinations as favorites to prioritize them in suggestions.

- User taps ⭐ on a combination after logging
- Favorites appear more frequently in suggestions
- Separate "Favorites" view to see all starred combos
- Still respects cooldown (favorite eaten yesterday won't appear today)

#### 2. "New!" Badge
Visual indicator on combinations the user hasn't tried recently (or ever).

- Badge appears on suggestion cards
- Encourages discovery and experimentation
- "New!" = never logged OR not logged in 7+ days
- Helps users break out of repetitive patterns

#### 3. Variety Color Coding
Color-coded visual indicators showing recency of each suggestion.

| Color | Meaning |
|-------|---------|
| 🟢 Green | Haven't had in 3+ days (fresh choice) |
| 🟡 Yellow | Had 1-2 days ago (recent) |
| 🔴 Red | Had today (shouldn't appear, but visual fallback) |

- Applied to suggestion cards
- Quick visual scan to pick "freshest" option
- Optional: can be toggled off in settings

#### 4. Variety Stats
Personalization stats showing user's variety patterns over time.

**Examples:**
- "You've tried 15 different breakfast combinations this month!"
- "Your most common breakfast is milk + cereals (8 times)"
- "You've used 12 of your 18 ingredients this week"
- "Variety score: 78% (good!)"

**Where to show:**
- Home screen summary card
- Dedicated "Stats" tab or section in History
- Weekly summary notification (optional)

#### 5. Haptic Feedback
Subtle vibration feedback for key interactions.

| Action | Haptic Type |
|--------|-------------|
| Select suggestion | Light tap |
| Confirm meal logged | Success vibration |
| Generate new ideas | Soft pulse |
| Add to favorites | Medium tap |

- Improves tactile feel of the app
- Can be disabled in settings for accessibility

#### 6. Ingredient Frequency Tracking
Track how often individual ingredients are used, not just combinations.

**Current:** Only tracks exact combination repetition
**Enhanced:** Also tracks ingredient-level frequency

**Benefits:**
- "You've had milk 5 days in a row - try yogurt?"
- Encourage rotation at ingredient level, not just combo level
- Identify over-relied-on ingredients
- Smarter suggestions that rotate base ingredients

**Implementation:**
- Add `ingredient_usage` table or aggregate from meal_logs
- Variety scoring includes ingredient frequency penalty
- Optional: "Ingredient rotation mode" that prioritizes unused ingredients

---

### Medium Effort

#### 7. Pairing Rules
Define which ingredients pair well together (or should be avoided).

**Positive pairings (suggestions):**
- milk → pairs well with: cereals, cookies
- bread → pairs well with: butter, cheese, jam

**Negative pairings (avoid):**
- butter → avoid with: yogurt (maybe?)
- milk → avoid with: cheese (same meal)

**Implementation approaches:**
1. **User-defined rules**: User marks "these go well" or "avoid together"
2. **Learned from history**: System notices user never picks certain combos
3. **Predefined cultural rules**: Portuguese breakfast conventions

**V1 approach was:** Trust randomness, let user reject bad combos
**Enhanced:** Use rules to filter before showing suggestions

#### 8. Smooth Animations
Polish the UX with meaningful animations.

| Animation | Purpose |
|-----------|---------|
| Card slide-in | Suggestions load with staggered entrance |
| Checkmark animation | Satisfying confirmation when meal logged |
| Swipe to dismiss | Reject a suggestion with gesture |
| Pull to refresh | Generate new suggestions |
| Star burst | When adding to favorites |

**Libraries:** React Native Reanimated, Lottie for complex animations

#### 9. Preparation Details
Track how ingredients are prepared (toast vs fresh, etc.) - *See "Data Model Evolution" section for full design.*

This is already documented in the Data Model Evolution section with:
- Approach C: Flexible Meals (recommended)
- Hybrid preparation method list
- Migration path from current model

---

### Implementation Priority Suggestion

| Priority | Enhancement | Effort | Impact |
|----------|-------------|--------|--------|
| 1 | Favorite combinations | Low | High - users want to save what works |
| 2 | Variety color coding | Low | Medium - quick visual feedback |
| 3 | "New!" badge | Low | Medium - encourages exploration |
| 4 | Ingredient frequency tracking | Medium | High - smarter variety |
| 5 | Variety stats | Low | Medium - engagement/delight |
| 6 | Haptic feedback | Low | Low - polish |
| 7 | Pairing rules | Medium | Medium - better suggestions |
| 8 | Smooth animations | Medium | Low - polish |
| 9 | Preparation details | High | High - enables lunch/dinner |

---

## Final Thoughts

This idea has legs because:
- **Real problem**: Decision fatigue is real, especially for daily recurring choices
- **Cultural fit**: Respects Portuguese food traditions vs generic meal planning
- **Scalable**: Starts simple (breakfast) but can expand to full meal planning
- **AI opportunity**: Variations and discovery without needing recipe databases
- **Personal tool**: Built for actual use, not theoretical problem

The breakfast/snack scope is perfect for validation:
- Simple enough to build quickly
- Complex enough to test core concepts (variety, combinations, tracking)
- Useful enough to use daily if it works

Key insight: This isn't really a "meal randomizer" - it's a **variety enforcer with smart suggestions**. The value is in preventing repetition and reducing cognitive load, not in random chaos.

Next: Research existing solutions and prototype combination generation logic.
