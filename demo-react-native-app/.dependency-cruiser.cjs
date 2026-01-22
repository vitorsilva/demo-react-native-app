/** @type {import('dependency-cruiser').IConfiguration} */
module.exports = {
  forbidden: [
    // ═══════════════════════════════════════════════════════════════
    // STANDARD RULES (from dependency-cruiser defaults)
    // ═══════════════════════════════════════════════════════════════
    {
      name: 'no-circular',
      severity: 'error',
      comment: 'Circular dependencies cause maintainability issues',
      from: {},
      to: { circular: true }
    },
    {
      name: 'no-orphans',
      severity: 'warn',
      comment: 'Unused modules should be removed',
      from: {
        orphan: true,
        pathNot: [
          '(^|/)\\.[^/]+\\.(js|cjs|mjs|ts|json)$', // Config files
          '\\.d\\.ts$',                              // Type definitions
          '(^|/)tsconfig\\.json$',
          '(^|/)jest\\.config\\.(js|ts)$',
          '__mocks__',
          '__tests__',
          'e2e/'
        ]
      },
      to: {}
    },
    {
      name: 'not-to-test',
      severity: 'error',
      comment: 'Production code cannot import test files',
      from: { pathNot: ['__tests__', '__mocks__', '\\.test\\.ts$', 'e2e/'] },
      to: { path: ['__tests__', '__mocks__', '\\.test\\.ts$'] }
    },

    // ═══════════════════════════════════════════════════════════════
    // SABORSPIN ARCHITECTURE RULES
    // ═══════════════════════════════════════════════════════════════

    // Rule 1: Screens must use store, not database directly
    // Exception: _layout.tsx can import database for one-time initialization
    {
      name: 'screens-through-store',
      severity: 'error',
      comment: 'Screens must access data through the store, not database directly',
      from: { path: '^app/', pathNot: '^app/_layout\\.tsx$' },
      to: { path: '^lib/database/' }
    },

    // Rule 2: Screens should not import business logic directly
    {
      name: 'screens-through-store-logic',
      severity: 'error',
      comment: 'Screens must access business logic through the store',
      from: { path: '^app/' },
      to: { path: '^lib/business-logic/' }
    },

    // Rule 3: Components are presentational (no store, no database)
    {
      name: 'components-no-store',
      severity: 'error',
      comment: 'Components should be presentational, receive data via props',
      from: { path: '^components/' },
      to: { path: '^lib/store/' }
    },
    {
      name: 'components-no-database',
      severity: 'error',
      comment: 'Components should not access database directly',
      from: { path: '^components/' },
      to: { path: '^lib/database/' }
    },
    {
      name: 'components-no-business-logic',
      severity: 'error',
      comment: 'Components should not import business logic',
      from: { path: '^components/' },
      to: { path: '^lib/business-logic/' }
    },

    // Rule 4: Business logic must be pure (no database imports)
    {
      name: 'business-logic-pure',
      severity: 'error',
      comment: 'Business logic should be pure functions, no database access',
      from: { path: '^lib/business-logic/' },
      to: { path: '^lib/database/' }
    },
    {
      name: 'business-logic-no-store',
      severity: 'error',
      comment: 'Business logic should not depend on store',
      from: { path: '^lib/business-logic/' },
      to: { path: '^lib/store/' }
    },

    // Rule 5: Database layer is independent
    {
      name: 'database-no-store',
      severity: 'error',
      comment: 'Database layer should not depend on store',
      from: { path: '^lib/database/' },
      to: { path: '^lib/store/' }
    },
    {
      name: 'database-no-business-logic',
      severity: 'error',
      comment: 'Database layer should not depend on business logic',
      from: { path: '^lib/database/' },
      to: { path: '^lib/business-logic/' }
    },

    // Rule 6: Telemetry is independent (one-way dependencies)
    {
      name: 'telemetry-independent',
      severity: 'error',
      comment: 'Telemetry should not depend on app-specific code',
      from: { path: '^lib/telemetry/' },
      to: {
        path: ['^app/', '^components/', '^lib/store/', '^lib/database/', '^lib/business-logic/']
      }
    },

    // Rule 7: Types are pure definitions
    {
      name: 'types-no-imports',
      severity: 'error',
      comment: 'Type files should only contain type definitions',
      from: { path: '^types/' },
      to: {
        path: ['^app/', '^components/', '^lib/'],
        pathNot: ['\\.d\\.ts$']
      }
    }
  ],

  options: {
    doNotFollow: {
      path: ['node_modules', '\\.git']
    },
    tsPreCompilationDeps: true,
    tsConfig: { fileName: 'tsconfig.json' },
    enhancedResolveOptions: {
      exportsFields: ['exports'],
      conditionNames: ['import', 'require', 'node', 'default', 'types'],
      mainFields: ['module', 'main', 'types']
    },
    reporterOptions: {
      dot: {
        collapsePattern: 'node_modules/(?:@[^/]+/[^/]+|[^/]+)'
      },
      text: {
        highlightFocused: true
      }
    }
  }
};
