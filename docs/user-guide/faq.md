# Frequently Asked Questions

## General

### What is SaborSpin?

SaborSpin is a mobile app that generates varied meal suggestions based on your ingredients and eating history. It uses a "variety engine" to prevent repetition.

### Why "SaborSpin"?

"Sabor" means "flavor" in Portuguese. The name reflects the app's Portuguese origins and the idea of "spinning" through different flavor combinations.

### Is my data stored in the cloud?

No. All your data is stored locally on your device. There are no accounts, no cloud sync, and no data collection. Your meal history stays on your phone.

### Does SaborSpin work offline?

Yes! Since all data is stored locally, the app works completely offline.

## Ingredients & Meals

### Why don't I see certain ingredients in suggestions?

Possible reasons:
1. **Cooldown active** - You ate that ingredient recently
2. **Ingredient disabled** - Check if it's toggled off
3. **Wrong meal type** - The ingredient might not be assigned to that meal type

### How does the variety/cooldown system work?

When you log a meal, the ingredients in that meal enter a "cooldown period" for that meal type. They won't appear in suggestions until the cooldown expires.

**Example:** With a 3-day cooldown, eggs eaten Monday won't appear in suggestions until Thursday.

### Can I use the same ingredient for multiple meal types?

Yes! When adding or editing an ingredient, you can select multiple meal types (breakfast, snack, lunch, etc.).

### Why can't I delete a category?

Categories with assigned ingredients cannot be deleted. First, reassign or delete the ingredients in that category.

### Why can't I delete an ingredient?

You cannot delete the last active ingredient. There must always be at least one active ingredient for the app to generate suggestions.

## Meal Types

### What's the difference between min and max ingredients?

- **Min ingredients** - The fewest ingredients a suggestion will have
- **Max ingredients** - The most ingredients a suggestion will have

Each suggestion will have a random number between min and max.

### What does "cooldown days" mean?

The number of days an ingredient is excluded from suggestions after you eat it. Higher = more variety, but requires more ingredients.

### Can I add my own meal types?

Yes! Go to Settings and tap "Add Meal Type". You can create Lunch, Dinner, Dessert, or any custom meal type.

## Technical

### Why does web mode lose my data on refresh?

The web version uses an in-memory database (for technical reasons). For persistent data, use the mobile app.

### How do I backup my data?

Currently, there's no built-in backup feature. Your data is stored in the app's local database on your device.

### Why won't the app connect to my phone?

Make sure:
1. Phone and computer are on the same WiFi network
2. Firewall allows ports 8081/8082
3. Try using `npx expo start --tunnel`

## Troubleshooting

### The app is showing empty suggestions

Check:
1. You have active ingredients assigned to that meal type
2. Your cooldown period isn't too long relative to your ingredient count
3. Try generating new suggestions

### Ingredients aren't saving

Make sure you tap "Save" after making changes. If issues persist, try restarting the app.

### The app crashed

Try:
1. Close and reopen the app
2. If it keeps crashing, reinstall the app (note: this will delete your data)

## Feature Requests

### Will there be cloud sync?

This is being considered for a future version. For now, the app is designed to be local-first for privacy.

### Will there be an iOS version?

The app is built with React Native and works on iOS. Look for it in the App Store soon.

### Can I suggest a feature?

Yes! Create an issue on [GitHub](https://github.com/vitorsilva/saborspin/issues) with the "enhancement" label.

## Contact

- **Bug reports:** [GitHub Issues](https://github.com/vitorsilva/saborspin/issues)
- **Feature requests:** [GitHub Issues](https://github.com/vitorsilva/saborspin/issues)
- **Website:** [saborspin.com](https://saborspin.com)
