---
description: Initialize or continue work on any phase. Usage: /phase 3.1 [init|next|status]
argument-hint: "<phase-number> [init|next|status]"
---

# Generic Phase Orchestrator

Execute tasks from any phase file in sequence.

## Arguments

- `$ARGUMENTS` format: `<phase-number> [action]`
- Examples:
  - `/phase 3.1 init` - Initialize tasks from Phase 3.1
  - `/phase 3.1 next` - Execute next available task
  - `/phase 3.1 status` - Show current progress

## Phase File Location

All phase files follow the pattern:
`docs/learning/epic04_feature_enhancement/PHASE{X.Y}_*.md`

Parse the phase number from arguments and find the matching file.

For example:
- Phase `3.1` -> `PHASE3.1_*.md`
- Phase `3.2` -> `PHASE3.2_*.md`
- Phase `0.1` -> `PHASE0.1_*.md`

## Actions

### `init` - Initialize Task List

1. Read the phase markdown file
2. Find the "## Implementation Order" section
3. Parse the markdown table with columns: Order | Task | Type | Effort | Notes | Status
4. For each row, call TaskCreate with:
   - subject: `[Phase X.Y] Task N: <Task description>`
   - description: Include Type, Effort, Notes from the table
   - activeForm: Present continuous form (e.g., "Creating feature branch" for "Create feature branch")
5. After creating all tasks, set up sequential dependencies using TaskUpdate:
   - Task 2 is blocked by Task 1
   - Task 3 is blocked by Task 2
   - etc.
6. Show task list summary with TaskList

### `next` - Execute Next Task

1. Call TaskList
2. Filter to tasks matching `[Phase X.Y]` prefix
3. Find first task with status: pending and no active blockers (blockedBy is empty or all blocking tasks are completed)
4. If found:
   - Call TaskUpdate: status → in_progress
   - Read the task details with TaskGet
   - Execute the task based on Type:
     - **Setup**: Git operations, file creation (e.g., create feature branch)
     - **Documentation**: Screenshots, notes, capture visual state
     - **Testing**: Run test commands (npm test, npm run test:e2e, maestro test)
     - **Quality**: Run quality checks (arch:test, lint:dead-code, etc.)
     - **Implementation**: Write code, create/modify files
   - After completion, call TaskUpdate: status → completed
   - Show what was accomplished and the next available task
5. If no task found, report "All tasks completed" or "No unblocked tasks available"

### `status` - Show Progress

1. Call TaskList
2. Filter to tasks matching `[Phase X.Y]` prefix
3. Display summary:
   - Completed: X/Y tasks
   - In Progress: Task N (if any)
   - Next Available: Task M (first pending with no blockers)
   - Blocked: List of tasks waiting on others

## Task Naming Convention

Tasks are prefixed for filtering:
- `[Phase 3.1] Task 1: Create feature branch`
- `[Phase 3.2] Task 1: Create feature branch`

This allows multiple phases to coexist in the task list.

## Table Parsing

The Implementation Order table format is:
```markdown
| Order | Task | Type | Effort | Notes | Status |
|-------|------|------|--------|-------|--------|
| 1 | Create feature branch | Setup | ~5 min | Branch from main | not started |
| 2 | Capture BEFORE screenshots | Documentation | ~10 min | Home screen | not started |
```

Parse each row to extract:
- Order: Task number (integer)
- Task: Task description (string)
- Type: Setup, Documentation, Testing, Quality, Implementation
- Effort: Time estimate (string, for reference)
- Notes: Additional context (string)
- Status: Current status in the markdown file (string, for reference)

## Error Handling

- If phase file not found: Report "Phase file not found for X.Y. Available phases: ..."
- If no Implementation Order table: Report "No Implementation Order table found in phase file"
- If action not recognized: Report "Unknown action. Use: init, next, or status"

## Session Continuity

Tasks persist across sessions. When resuming:
- `/phase X.Y status` shows where you left off
- `/phase X.Y next` continues from the next available task

## Important Notes

- The `init` action creates tasks from the phase file. Run it once per phase.
- Running `init` again on a phase with existing tasks will show a warning.
- Tasks are executed sequentially based on the Order column.
- The Type field guides how to execute each task.
