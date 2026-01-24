#!/bin/bash
# Usage: ./ralph.sh 5 (to run 5 tasks)

ITERATIONS=${1:-5}

for ((i=1; i<=ITERATIONS; i++)); do
  echo "--- Starting Ralph Iteration $i ---"
  
  # We call 'claude' and feed it the PRD and Progress file as context
  claude --permission-mode acceptEdits --allowedTools "Bash(npm test:*)" "Bash(git:*)" "Bash(npm run test)" "Bash(npm run web)" "Bash(npm start)"  "Bash(maestro test:*)" "Bash(expo run:*)" --add-dir . -p "
    @docs\learning\epic04_feature_enhancement\features\FEATURE_1.3_COLOR_CODING.md 
    @docs\learning\epic04_feature_enhancement\features\FEATURE_1.3_progress.md

    before starting, make sure you are on the FEATURE_1.3_COLOR_CODING branch in git if not, create worktree and switch to it.

    1. Read @docs\learning\epic04_feature_enhancement\features\FEATURE_1.3_COLOR_CODING.md and look in the ## implementation order for the task 'not started' with the lowest number
    2. Make sure you understand the task fully
    4. Implement ONLY that task
    5. Run unit test and linting to verify your work.
    6. If tests pass: 
      6.1 - Update @docs\learning\epic04_feature_enhancement\features\FEATURE_1.3_COLOR_CODING.md status to 'done'.
      6.2 - Append learning notes with errors / problems / fixes / workarounds to @docs\learning\epic04_feature_enhancement\features\FEATURE_1.3_COLOR_CODING_LEARNING_NOTES.md
      6.3 - Append a summary of what you did to @docs\learning\epic04_feature_enhancement\features\FEATURE_1.3_progress.md.
      6.4 - Commit the changes with a clear message.
      6.5 - go to step 8.
    7. if test not pass:
      7.1 Debug and fix the issue.
      7.2 Repeat step 5.
    8. Only after ALL tasks in FEATURE_1.3_COLOR_CODING.md are marked done, output exactly: <promise>COMPLETE</promise>  
  " 2>&1 | tee -a last_output.log

  # Stop the loop if Claude says it's finished
  if grep -q "<promise>COMPLETE</promise>" last_output.log; then
    echo "PRD Complete!"
    break
  fi  
done