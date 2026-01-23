#!/bin/bash
# Usage: ./ralph.sh 5 (to run 5 tasks)

ITERATIONS=${1:-5}

for ((i=1; i<=ITERATIONS; i++)); do
  echo "--- Starting Ralph Iteration $i ---"
  
  # We call 'claude' and feed it the PRD and Progress file as context
  claude --permission-mode acceptEdits --allowedTools "Bash(npm test:*)" "Bash(git:*)" "Bash(npm run test)" --add-dir . -p "
    @docs\learning\epic04_feature_enhancement\features\FEATURE_1.1_FAVORITES.md 
    @docs\learning\epic04_feature_enhancement\features\FEATURE_1.1_progress.md

    1. Read @docs\learning\epic04_feature_enhancement\features\FEATURE_1.1_FAVORITES.md  and look in the ## implementation order for the task 'not started' with the lowest number
    2. Make sure you understand the task fully
    3. Make sure you are on the FEATURE_1.1_FAVORITE branch in git if not, switch to it.
    4. Implement ONLY that task
    5. Run unit tests and linting to verify your work.
    6. If tests pass: 
      - Update @docs\learning\epic04_feature_enhancement\features\FEATURE_1.1_FAVORITES.md status to 'done'.
      - Append learning notes with errors / problems / fixes / workarounds to @docs\learning\epic04_feature_enhancement\features\FEATURE_1.1_FAVORITES_LEARNING_NOTES.md
      - Append a summary of what you did to @docs\learning\epic04_feature_enhancement\features\FEATURE_1.1_progress.md.
      - Commit the changes with a clear message.
    7. Only after ALL tasks in FEATURE_1.1_FAVORITES.md are marked done, output exactly: <promise>COMPLETE</promise>  
  " 2>&1 | tee -a last_output.log

  # Stop the loop if Claude says it's finished
  if grep -q "<promise>COMPLETE</promise>" last_output.log; then
    echo "PRD Complete!"
    break
  fi  
done