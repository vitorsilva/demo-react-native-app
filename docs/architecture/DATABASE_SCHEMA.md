# Database Schema

## Overview

SaborSpin uses SQLite for local data persistence. The database is platform-specific:
- **Native (iOS/Android):** expo-sqlite (persisted)
- **Web:** sql.js (in-memory, lost on refresh)
- **Tests:** better-sqlite3

## Tables

### ingredients

Stores all ingredients (seeded and user-added).

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | INTEGER | PRIMARY KEY | Auto-increment ID |
| name | TEXT | NOT NULL, UNIQUE | Ingredient name |
| meal_type | TEXT | NOT NULL | breakfast, snack, or both |
| category_id | TEXT | FOREIGN KEY | References categories(id) |
| is_active | INTEGER | DEFAULT 1 | 0=disabled, 1=enabled |
| is_user_added | INTEGER | DEFAULT 0 | 0=seeded, 1=user-added |
| created_at | TEXT | DEFAULT CURRENT_TIMESTAMP | Creation timestamp |
| updated_at | TEXT | DEFAULT CURRENT_TIMESTAMP | Last update timestamp |

### categories

Groups ingredients by category.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | TEXT | PRIMARY KEY | UUID |
| name | TEXT | NOT NULL, UNIQUE | Category name |
| created_at | TEXT | DEFAULT CURRENT_TIMESTAMP | Creation timestamp |
| updated_at | TEXT | DEFAULT CURRENT_TIMESTAMP | Last update timestamp |

### meal_types

Configurable meal types with generation settings.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | TEXT | PRIMARY KEY | UUID |
| name | TEXT | NOT NULL, UNIQUE | Internal name (lowercase) |
| display_name | TEXT | NOT NULL | User-facing name |
| min_ingredients | INTEGER | DEFAULT 2 | Minimum ingredients per suggestion |
| max_ingredients | INTEGER | DEFAULT 4 | Maximum ingredients per suggestion |
| cooldown_days | INTEGER | DEFAULT 3 | Days before ingredient can repeat |
| is_active | INTEGER | DEFAULT 1 | 0=disabled, 1=enabled |
| created_at | TEXT | DEFAULT CURRENT_TIMESTAMP | Creation timestamp |
| updated_at | TEXT | DEFAULT CURRENT_TIMESTAMP | Last update timestamp |

### meal_logs

Records of meals the user has logged.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | INTEGER | PRIMARY KEY | Auto-increment ID |
| ingredients | TEXT | NOT NULL | JSON array of ingredient names |
| meal_type | TEXT | NOT NULL | Meal type name |
| logged_at | TEXT | DEFAULT CURRENT_TIMESTAMP | When meal was logged |

### migrations

Tracks which database migrations have been applied.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | INTEGER | PRIMARY KEY | Migration version number |
| name | TEXT | NOT NULL | Migration description |
| applied_at | TEXT | DEFAULT CURRENT_TIMESTAMP | When applied |

## Relationships

```
categories (1) ------< (many) ingredients
                        via category_id

meal_types (1) ------< (many) ingredients
                        via meal_type name

meal_types (1) ------< (many) meal_logs
                        via meal_type name
```

## Migration History

| Version | Description |
|---------|-------------|
| 1 | Initial schema (categories, meal_types, ingredient columns) |
| 2 | Fix ingredients.category_id type (INTEGER to TEXT) |
| 3 | Rebuild categories table with correct schema |

## Database Operations

All database operations are in `lib/database/`:

| File | Purpose |
|------|---------|
| `index.ts` | Database initialization, platform detection |
| `schema.ts` | Table creation SQL |
| `migrations.ts` | Migration runner |
| `ingredients.ts` | Ingredient CRUD |
| `categories.ts` | Category CRUD |
| `mealTypes.ts` | Meal type CRUD |
| `mealLogs.ts` | Meal log CRUD |
| `validation.ts` | Data validation functions |
| `seed.ts` | Seed data (Portuguese ingredients) |

## Related Documentation

- [System Overview](./SYSTEM_OVERVIEW.md)
- [State Management](./STATE_MANAGEMENT.md)
