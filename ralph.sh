#!/bin/bash
# Usage: ./ralph.sh 5 (to run 5 tasks)

ITERATIONS=${1:-5}

for ((i=1; i<=ITERATIONS; i++)); do
  echo "--- Starting Ralph Iteration $i ---"
  
  # We call 'claude' and feed it the PRD and Progress file as context
  claude --permission-mode acceptEdits --allowedTools  "Read(//c/Users/vitor410rodrigues/source/repos/demo-pwa-app/**)"       "Read(//c/Users/vitor410rodrigues/source/repos/my-mindmap/**)"       "Edit(//c/Users/vitor410rodrigues/source/repos/demo-react-native-app/**)"       "WebSearch"       "Bash(mkdir:*)"       "Bash(git mv:*)"       "Bash(git add:*)"       "Bash(git commit:*)"       "mcp__context7__resolve-library-id"       "Bash(dir:*)"       "Bash(nul)"       "WebFetch(domain:docs.sentry.io)"       "mcp__context7__get-library-docs"       "WebFetch(domain:docs.expo.dev)"       "Bash(npx tsc:*)"       "Bash(npm run web:*)"       "Bash(ping:*)"       "Bash(netstat:*)"       "Bash(findstr:*)"       "Bash(cmd //c \"taskkill /PID 6024 /F\")"       "mcp__playwright__browser_navigate"       "mcp__playwright__browser_snapshot"       "mcp__playwright__browser_click"       "mcp__playwright__browser_take_screenshot"       "mcp__playwright__browser_console_messages"       "Bash(npm install:*)"       "Bash(npm run lint)"       "Bash(npx playwright test:*)"       "Bash(timeout 120 sh:*)"       "Bash(ls:*)"       "Bash(find:*)"       "Bash(cat:*)"       "Bash(npm run test:e2e:*)"       "Bash(npm test:*)"       "Bash(test:*)"       "Bash(curl:*)"       "mcp__playwright__browser_type"       "mcp__playwright__browser_handle_dialog"       "mcp__playwright__browser_wait_for"       "mcp__playwright__browser_evaluate"       "mcp__playwright__browser_close"       "Bash(eas build:*)"       "Bash(npx eas-cli:*)"       "Bash(npx expo start:*)"       "Bash(emulator -list-avds:*)"       "Bash(\"%LOCALAPPDATA%\\\\Android\\\\Sdk\\\\emulator\\\\emulator.exe\" -list-avds)"       "Bash(\"C:\\\\Users\\\\omeue\\\\AppData\\\\Local\\\\Android\\\\Sdk\\\\emulator\\\\emulator.exe\" -list-avds)"       "Bash(\"C:\\\\Users\\\\omeue\\\\AppData\\\\Local\\\\Android\\\\Sdk\\\\emulator\\\\emulator.exe\" -avd Medium_Phone_API_36.1)"       "Bash(\"C:\\\\Users\\\\omeue\\\\AppData\\\\Local\\\\Android\\\\Sdk\\\\platform-tools\\\\adb.exe\" devices)"       "Bash(node scripts/generate-icons.js:*)"       "mcp__playwright__browser_resize"       "Bash(git push:*)"       "Bash(git checkout:*)"       "Bash(npm uninstall:*)"       "WebFetch(domain:intlayer.org)"       "WebFetch(domain:starter.obytes.com)"       "WebFetch(domain:react.i18next.com)"       "Bash(tree:*)"       "Bash(wc:*)"       "WebFetch(domain:www.npmjs.com)"       "Bash(npx expo install:*)"       "Bash(git restore:*)"       "Bash(gh pr create:*)"       "Bash(maestro --version:*)"       "Bash(adb kill-server:*)"       "Bash(adb start-server:*)"       "Bash(adb:*)"       "Bash(taskkill:*)"       "Bash($env:LOCALAPPDATA/Android/Sdk/emulator/emulator -list-avds)"       "Bash(cmd //c:*)"       "Bash(eas build:view:*)"       "Bash(powershell -ExecutionPolicy Bypass -File scripts/download-apk.ps1)"       "Bash(gh pr view:*)"       "Bash(gh pr edit:*)"       "Bash(npm run test:mutation:core:*)"       "Bash(npm run test:mutation:validation:*)"       "Bash(npm run test:mutation:db:*)"       "Bash(npm run arch:test:*)"       "Bash(where dot:*)"       "Bash(npm run arch:graph:*)"       "Bash(npm run arch:report:*)"       "Bash(start reports/architecture/index.html)"       "mcp__playwright__browser_press_key"       "Bash(npm run lint:*)"       "Bash(npm run lint:duplicates:*)"       "Bash(npx commitlint)"       "Bash(git branch:*)"       "Bash(git pull:*)"       "Bash(npx eslint:*)"       "Bash(pip --version:*)"       "Bash(semgrep:*)"       "Bash(pip show:*)"       "Bash(python -m semgrep:*)"       "Bash(cmd /c \"where semgrep 2>nul\")"       "Bash(python:*)"       "Bash(npx jscpd:*)"       "Bash(timeout:*)"       "Bash(npm run security:scan:*)"       "Bash(nslookup:*)"       "Bash(npm run deploy:landing:*)"       "Bash(gh pr:*)"       "Bash(node --version:*)"       "Bash(npm --version)"       "Bash(npx expo --version)"       "Bash(git --version:*)"       "Bash(docker --version:*)"       "Bash(npx playwright:*)"       "Bash(eas --version:*)"       "Bash(docker-compose:*)"       "Bash(eas whoami:*)"       "Bash(npm run lint:dead-code:*)"       "Bash(git -C C:/Users/omeue/source/repos/demo-react-native-app remote -v)"       "Bash(git -C C:/Users/omeue/source/repos/demo-react-native-app rev-parse --short HEAD)"       "Bash(git -C C:/Users/omeue/source/repos/demo-react-native-app log --oneline -3)"       "Bash(npm run test:mutation:*)" "Bash(npx tsx:*)"      "Bash(./node_modles/.bin/tsc:*)"      "Bash(node:*)"      "Bash(npm run:*)"      "Bash(grep:*)" "Bash(cmd.exe /c \"%LOCALAPPDATA%\\\\Android\\\\Sdk\\\\emulator\\\\emulator.exe -list-avds\")" "Bash(\"/c/Users/omeue/AppData/Local/Android/Sdk/emulator/emulator.exe\" -list-avds)" "Bash(maestro test:*)" "Bash(eas build:list:*)"	     --add-dir . -p "
    @docs\learning\epic04_feature_enhancement\features\FEATURE_1.5_HAPTIC_FEEDBACK.md 
    @docs\learning\epic04_feature_enhancement\features\FEATURE_1.5_progress.md

    # do it once before starting
    1. Read @docs\learning\epic04_feature_enhancement\features\FEATURE_1.5_HAPTIC_FEEDBACK.md and IDENTITY in the **## implementation order** the task 'not started' with the lowest number
    2. Make sure you understand the task fully
    3. Make sure you are on the FEATURE_1.5_HAPTIC_FEEDBACK branch in git if not, create worktree and switch to it.
    4. remember that codebase is in demo-react-nateive-app subfolder

    # Implementation
    1. Implement **ONLY** that task that was 'not started' with the lowest number in the order specified.
    2. if task is of type "Implementation" or "Testing" Make sure TypeScript check passes (npx tsc --noEmit) and Linter passes (npm run lint) to verify your work, don't forget to fix any issues found.
    3. when tests pass: 
      3.1 - Update @docs\learning\epic04_feature_enhancement\features\FEATURE_1.5_HAPTIC_FEEDBACK.md status to 'done'.
      3.2 - Append learning notes with errors / problems / fixes / workarounds to @docs\learning\epic04_feature_enhancement\features\FEATURE_1.5_HAPTIC_FEEDBACK_LEARNING_NOTES.md
      3.3 - Append a summary of what you did to @docs\learning\epic04_feature_enhancement\features\FEATURE_1.5_progress.md.
      3.4 - Commit the changes with a clear message.
    4. if ALL tasks in FEATURE_1.5_HAPTIC_FEEDBACK.md in the ## implementation order are marked done, output exactly: <promise>COMPLETE</promise> and STOP. Do NOT proceed to the next task. End the process in an orderly fashion.
    5. if current task id completed output <task>DONE</task> and STOP. Do NOT proceed to the next task. Exit immediately. End the process in an orderly fashion.
  " 2>&1 | tee -a last_output.log

  # Stop the loop if Claude says it's finished
  if tail -n 3 last_output.log | grep -q "<promise>COMPLETE</promise>"; then
    echo "PRD Complete!"
    break 
  else
    echo "Continuing to next iteration..."
  fi  
done