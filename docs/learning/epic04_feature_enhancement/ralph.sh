#!/bin/bash
# Usage: ./ralph.sh 5 (to run 5 tasks)

ITERATIONS=${1:-5}

for ((i=1; i<=ITERATIONS; i++)); do
  echo "--- Starting Ralph Iteration $i ---"
  
  # We call 'claude' and feed it the PRD and Progress file as context
  claude -p "say hello
  " | tee last_output.log

  # Stop the loop if Claude says it's finished
  if grep -q "<promise>COMPLETE</promise>" last_output.log; then
    echo "PRD Complete!"
    break
  fi  
done