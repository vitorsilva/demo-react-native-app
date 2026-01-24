#!/bin/bash
# Usage: ./ralph.sh 5 (to run 5 tasks)

ITERATIONS=${1:-5}

for ((i=1; i<=ITERATIONS; i++)); do
  echo "--- Starting Ralph Iteration $i ---"
  
  # We call 'claude' and feed it the PRD and Progress file as context
  claude --permission-mode acceptEdits --allowedTools "Bash(npm test:*)" "Bash(git:*)" "Bash(npm run test)" --add-dir . -p "
    @docs\learning\epic04_feature_enhancement\features\FEATURE_1.2_NEW_BADGE.md 
    @docs\learning\epic04_feature_enhancement\features\FEATURE_1.2_progress.md

    1. Read @docs\learning\epic04_feature_enhancement\features\FEATURE_1.2_NEW_BADGE.md  and look in the ## implementation order for the task 'not started' with the lowest number
    2. Make sure you understand the task fully
    3. Make sure you are on the FEATURE_1.2_NEW_BADGE branch in git if not, create worktree and switch to it.
    4. Implement ONLY that task
    5. Run unit test and linting to verify your work.
    6. If tests pass: 
      - Update @docs\learning\epic04_feature_enhancement\features\FEATURE_1.2_NEW_BADGE.md status to 'done'.
      - Append learning notes with errors / problems / fixes / workarounds to @docs\learning\epic04_feature_enhancement\features\FEATURE_1.2_NEW_BADGE_LEARNING_NOTES.md
      - Append a summary of what you did to @docs\learning\epic04_feature_enhancement\features\FEATURE_1.2_progress.md.
      - Commit the changes with a clear message.
    7. if test not pass:
      - Debug and fix the issue.
      - Repeat step 5.
    7. Only after ALL tasks in FEATURE_1.2_NEW_BADGE.md are marked done, output exactly: <promise>COMPLETE</promise>  
  " 2>&1 | tee -a last_output.log

  # Stop the loop if Claude says it's finished
  if grep -q "<promise>COMPLETE</promise>" last_output.log; then
    echo "PRD Complete!"
    break
  fi  
done