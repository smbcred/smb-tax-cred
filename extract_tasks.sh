#!/bin/bash

# Create acceptance directory
mkdir -p docs/acceptance

# Read the guide and extract task information
GUIDE_FILE="docs/rd-saas-complete-guide.v2.md"

# Extract task information with awk
awk '
BEGIN { 
    task_id = ""
    title = ""
    purpose = ""
    in_requirements = 0
    requirements = ""
}

# Match task headers
/^### Task [0-9]+\.[0-9]+\.[0-9]+:/ {
    # Process previous task if exists
    if (task_id != "") {
        print_task()
    }
    
    # Extract task ID and title
    match($0, /### Task ([0-9]+\.[0-9]+\.[0-9]+): (.+)/, arr)
    task_id = arr[1]
    title = arr[2]
    purpose = ""
    requirements = ""
    in_requirements = 0
}

# Match purpose
/^\*\*Purpose\*\*:/ {
    gsub(/^\*\*Purpose\*\*: /, "")
    purpose = $0
}

# Match key requirements start
/^\*\*Key Requirements\*\*:/ {
    in_requirements = 1
    next
}

# Collect requirements
in_requirements && /^- / {
    gsub(/^- /, "")
    if (requirements != "") requirements = requirements "\n"
    requirements = requirements "- [ ] " $0
}

# Stop collecting requirements on next section
in_requirements && /^[^-]/ && !/^$/ {
    in_requirements = 0
}

function print_task() {
    filename = "docs/acceptance/" task_id ".md"
    
    print "---" > filename
    print "task_id: " task_id > filename
    print "title: " title > filename
    print "owner: agent" > filename
    print "status: todo" > filename
    print "---" > filename
    print "" > filename
    print "# Acceptance — Task " task_id ": " title > filename
    print "" > filename
    print "## Purpose" > filename
    print purpose > filename
    print "" > filename
    print "## Definition of Done (check all)" > filename
    print requirements > filename
    print "" > filename
    print "## Functional Checks" > filename
    print "- [ ] **Exists**: Files/components/routes created." > filename
    print "- [ ] **Wired**: UI → API → DB flow demonstrated." > filename
    print "- [ ] **Validated**: Server-side input validation returns clear errors." > filename
    print "- [ ] **Tested**: At least one unit or integration test (happy + error)." > filename
    print "- [ ] **UX/Copy**: Labels/CTAs match guide; mobile-friendly." > filename
    print "- [ ] **Security**: No secrets committed; rate-limit public endpoints." > filename
    print "" > filename
    print "## Non-Functional (as applicable)" > filename
    print "- [ ] **Performance**: No obvious jank; sensible batching/debouncing." > filename
    print "- [ ] **Accessibility**: Labels/focus/roles; AA contrast." > filename
    print "- [ ] **Telemetry**: Key events logged if defined." > filename
    print "" > filename
    print "## Artifacts to Update" > filename
    print "- [ ] `/docs/TASKS_for_v2.md` — mark " task_id " complete." > filename
    print "- [ ] `/docs/PROGRESS.md` — what changed and why (file links)." > filename
    print "- [ ] `/docs/BLOCKERS.md` — add/remove blockers." > filename
    print "" > filename
    print "## Manual QA Notes" > filename
    print "- Steps:" > filename
    print "- Results:" > filename
    print "" > filename
    print "## Verification Commands" > filename
    print "```bash" > filename
    print "npm --prefix client run typecheck && npm --prefix client run lint" > filename
    print "npm --prefix server run typecheck && npm --prefix server run lint" > filename
    print "npm --prefix client run build" > filename
    print "npm --prefix server run test" > filename
    print "```" > filename
    
    close(filename)
}

END {
    # Process last task
    if (task_id != "") {
        print_task()
    }
}
' "$GUIDE_FILE"

echo "Created acceptance files for all tasks"
