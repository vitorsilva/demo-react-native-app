# Phase 2 Screenshots

This folder contains screenshots documenting the Phase 2: Data Model Evolution feature implementation.

---

## BEFORE Screenshots (Pre-Implementation)

Since the feature was implemented before screenshots were captured, the **ASCII wireframes** in [PHASE2_DATA_MODEL_EVOLUTION.md](../PHASE2_DATA_MODEL_EVOLUTION.md) serve as the "BEFORE" reference.

### Reference: Meal Logging Flow - BEFORE
```
┌─────────────────────────────────────┐
│  Log Breakfast                      │
├─────────────────────────────────────┤
│                                     │
│  Your selection:                    │
│                                     │
│  • milk                             │
│  • bread                            │
│  • jam                              │
│                                     │
│  ┌─────────────────────────────────┐│
│  │         Confirm Meal            ││
│  └─────────────────────────────────┘│
│                                     │
└─────────────────────────────────────┘
```

### Reference: History Item Display - BEFORE
```
┌─────────────────────────────────────┐
│ milk + bread + jam                  │
│ Breakfast • 8:30 AM                 │
└─────────────────────────────────────┘
```

---

## AFTER Screenshots (Post-Implementation)

### Screenshot Checklist

| # | Screenshot | Description | Filename | Status |
|---|------------|-------------|----------|--------|
| 1 | Meal Logging | Confirmation modal with name input and prep selectors | `meal_logging_after.png` | Documented |
| 2 | Prep Method Picker | Modal showing preparation method options | `prep_method_picker.png` | Documented |
| 3 | History - Named Meal | History item showing a named meal | `history_named_meal.png` | Documented |
| 4 | History - Prep Methods | History item showing prep methods inline | `history_prep_methods.png` | Documented |
| 5 | Settings - Prep Methods | Preparation methods management section | `prep_methods_settings.png` | Documented |

### Reference: What Each Screenshot Should Show

#### 1. Meal Logging AFTER (`meal_logging_after.png`)
```
┌─────────────────────────────────────┐
│  Log Breakfast                      │
├─────────────────────────────────────┤
│                                     │
│  Name this meal (optional):         │  ← NEW: Text input
│  ┌─────────────────────────────────┐│
│  │ e.g., "Mom's special"           ││
│  └─────────────────────────────────┘│
│                                     │
│  Your selection:                    │
│                                     │
│  ┌─────────────────────────────────┐│
│  │ milk                    [None ▼]││  ← NEW: Prep selector
│  └─────────────────────────────────┘│
│  ┌─────────────────────────────────┐│
│  │ bread             [Toasted ▼]  ││  ← NEW: Prep selector
│  └─────────────────────────────────┘│
│  ┌─────────────────────────────────┐│
│  │ jam                     [None ▼]││
│  └─────────────────────────────────┘│
│                                     │
│  ┌─────────────────────────────────┐│
│  │         Confirm Meal            ││
│  └─────────────────────────────────┘│
│                                     │
└─────────────────────────────────────┘
```

**Key elements to capture:**
- Meal name input field at top
- Each ingredient row with prep method dropdown
- "None (as is)" default shown for ingredients without prep

#### 2. Preparation Method Picker (`prep_method_picker.png`)
```
┌─────────────────────────────────────┐
│  Preparation for "bread"            │
├─────────────────────────────────────┤
│                                     │
│  ○ None (as is)                     │
│  ○ Toasted                          │
│  ● Grilled                          │  ← Selected
│  ○ Fried                            │
│  ○ Baked                            │
│  ○ Steamed                          │
│  ○ Roasted                          │
│  ○ Boiled                           │
│  ─────────────────────────────────  │
│  ○ + Add custom...                  │
│                                     │
│  [Cancel]              [Apply]      │
│                                     │
└─────────────────────────────────────┘
```

**Key elements to capture:**
- Modal title showing ingredient name
- List of predefined preparation methods
- Selected method highlighted
- "Add custom" option at bottom
- Cancel and Apply buttons

#### 3. History - Named Meal (`history_named_meal.png`)
```
┌─────────────────────────────────────┐
│ "Mom's special breakfast"           │  ← Named meal title
│ milk + toasted bread + jam          │  ← Components with prep
│ Breakfast • 8:30 AM                 │
│                               [♡]   │
└─────────────────────────────────────┘
```

**Key elements to capture:**
- Named meal title prominently displayed
- Components shown below with preparation methods inline
- Meal type and time
- Favorite toggle (if applicable)

#### 4. History - Unnamed Meal with Prep Methods (`history_prep_methods.png`)
```
┌─────────────────────────────────────┐
│ grilled chicken + steamed rice      │  ← Prep methods inline
│ Lunch • 12:30 PM                    │
│                               [♡]   │
└─────────────────────────────────────┘
```

**Key elements to capture:**
- No meal name (unnamed)
- Preparation methods shown inline with ingredients
- Format: "{prep} {ingredient}" for items with prep

#### 5. Settings - Prep Methods Management (`prep_methods_settings.png`)
```
┌─────────────────────────────────────┐
│  Settings                           │
├─────────────────────────────────────┤
│                                     │
│  Preparation Methods                │
│  ┌─────────────────────────────────┐│
│  │ System Methods                  ││
│  │ fried | grilled | roasted | ... ││  ← Chips (read-only)
│  └─────────────────────────────────┘│
│  ┌─────────────────────────────────┐│
│  │ Custom Methods                  ││
│  │ air-fried           [Delete]   ││  ← User-added
│  │ smashed             [Delete]   ││
│  └─────────────────────────────────┘│
│  [+ Add Custom Method]              │
│                                     │
└─────────────────────────────────────┘
```

**Key elements to capture:**
- Section header "Preparation Methods"
- System methods shown as read-only chips
- Custom methods with delete buttons
- "Add Custom Method" button

---

## Capture Instructions

To capture actual screenshots:

### Prerequisites
```bash
cd demo-react-native-app
npm install
npm start
```

### Step-by-Step Capture Guide

#### Screenshot 1: Meal Logging
1. Navigate to Home tab
2. Tap a meal type button (e.g., "Breakfast")
3. Select 2-3 ingredients from suggestions
4. Modal appears showing confirmation
5. Capture screenshot showing:
   - Meal name input at top
   - Ingredient rows with prep method selectors

#### Screenshot 2: Prep Method Picker
1. From the confirmation modal
2. Tap on any ingredient's prep method selector
3. Picker modal appears
4. Capture screenshot showing:
   - All predefined methods listed
   - "Add custom" option visible

#### Screenshot 3: History - Named Meal
1. Log a meal WITH a name (e.g., "Weekend Brunch")
2. Navigate to History tab
3. Find the logged meal
4. Capture screenshot showing:
   - Named meal title displayed prominently
   - Components listed below

#### Screenshot 4: History - Prep Methods
1. Log a meal WITHOUT a name but WITH prep methods
2. Navigate to History tab
3. Find the logged meal
4. Capture screenshot showing:
   - Prep methods inline (e.g., "grilled chicken")

#### Screenshot 5: Settings - Prep Methods
1. Navigate to Settings tab
2. Scroll to "Preparation Methods" section
3. Capture screenshot showing:
   - System methods as chips
   - Custom methods section (add one first if empty)
   - Add button

### Saving Screenshots
- Use PNG format
- Save to this folder: `docs/learning/epic04_feature_enhancement/screenshots/`
- Use exact filenames from checklist above
- Update status to "Captured" in this README

---

## Notes

- Phase 2 implementation completed: 2026-01-25 to 2026-01-27
- Feature branch: `FEATURE_2.0_DATA_MODEL_EVOLUTION`
- Merged to main: 2026-01-27
- ASCII wireframes serve as documentation until actual screenshots are captured
- Actual screenshot capture requires running the app on device/emulator
