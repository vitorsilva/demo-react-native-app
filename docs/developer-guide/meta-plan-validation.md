create initial plan with main ideas
then ask to revise it to make sure it complies with this:

UI
- whenever we have a task that changes/creates UI elements we need to have on the plan the before and after wirefram so that we can better validate the plan
- whenever we have a task that changes/creates UI elements we need tasks to capture screenshots before (if applicable) and after implementation. those images should be saved in
- add to plan relevant ui instructions (what is the current ui patterns we're using)
TESTS
- make sure to include in all phases (if applicable) the creation and validation of unit tests tests as well as running pre-existing unit tests to make sure everything still passes 
- make sure to include in all phases (if applicable) the creation and validation of e2e tests as well as running pre-existing unit tests to make sure everything still passes 
- make sure to include in all phases (if applicable) the creation and validation of maestro tests as well as running pre-existing unit tests to make sure everything still passes. take in consideration that we strive to keep a good matching between playwright and maestro tests
QUALITY
- make sure that the first task of the plan is to get the codebase quality baseline, meaning: arch:test, lint:dead-code; lint:duplicates; security:scan)
- make sure in the end we run them again and compare results with baseline. if results get worse create an intermediate plan with the report so that we can address those issues after this phase and before the next planned phase
DOCS
- make sure for each phase we create learning notes (in separate and linked file) with unexpected errors, workarounds, fixes. only include actual learning notes, thing we learned during implementation
BRANCHING
- make sure for each phase we set the branching strategy: independent branch and small commits
TOOLS
- make sure to include instructions on how to run the tools needed - maestro, docker, others
REFERENCES
- make sure to include links for existing developer guides that may be relevant 
DEPLOY
- make sure the last task after running and passing all tests is deploying to staging and prod
MARKETING
- create MARKETING documentation
I18N
- make sure i18n is considered whenever UI elements are changed / created