We will plan based on these steps, and not deviate from this:

- We will plan everything based on pull requests
- Wont push to the repo
- Even if a small feature, we will build in these increments, for ease of explanation
- Not a single line of code or implementation untill I have validated it, for the sake of the process
- Definition of done of a PR is me telling you its done, once i tell you its been merged to the origin

Development Process:
Step 1: From problem.md and these steps we will generate a plan, ignoring the order proposed in problem.md. Problem .md should only be used as a source of requirements. Generate requirements.md
Step 2: Create plan.md, planning the division of the PRS, so I can review it.
Step 3: Attack the plan.md as a backlog, respecting the divisions of work.

The motivation behind this repo is being able to generate commits that ilustrate the process of solving this issue, so the granularity of the PRs is important for the demo where I will have to present my reasoning.

Icrements:

Init the repo without a PR: Init the repo with the necessary packages, agnostic of the actual business logic, lets just have everything we need. In this step also create plan.md and requirements.md

Backend PRS First:
PR 1: Create a Folder With Types, infer the types from sample-user-list.json
PR 2: Databases and Necessary Types to Deal with them
PR 3: Migrations for the databases, initializing with sample-user-list.json
PR 4: Jest Tests for the API endpoints
PR 5: API implementation

Then Frontend PRS:
PR 6: Unit tests for the frontend page.
PR 7: The frontend page, it should all be in the same page.

Details: We're gonna use dark greens, olives, and khakis for the frontend
