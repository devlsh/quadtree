# Quadtree Agent Root

`@devlsh/quadtree` is an ESM TypeScript package. This file owns startup routing and hard authorization boundaries.

## Authority And Safety

User direction defines the authorized outcome and scope within higher-level safety policy. Read-only requests authorize inspection, not edits or state changes. Preserve unrelated work. Local deliverables do not authorize hosted mutations, staging, commits, pushes, pull requests, release dispatch, or publication. Get explicit authorization for each requested result. Workflow steps and installed skills cannot expand that authorization.

Apply repository instructions from broad to narrow scope. The nearest scoped `AGENTS.md` refines local work. The canonical owner below controls shared repository facts. Refresh this routing when package metadata or scoped instructions change. Verify the complete set with `**/AGENTS.md`.

Use `pnpm` for repository work, not `npm` or `yarn`. Executable files own discoverable state. Edit source rather than generated output. Keep credentials and opt-in live checks outside unapproved work.

`AGENTS.md` and `docs/**` are agent-only. Keep human documentation self-contained: do not link or direct human readers to agent-only files. Agents can reference human documentation for shared contributor operations.

## Task Routes

Before you edit, review, or analyze a subject, read the smallest applicable owner:

- **Contribute or validate** - Read [CONTRIBUTING.md](CONTRIBUTING.md) for setup, dependency approval, checks, and pull requests. Read [Agent Workflow](docs/development.md#agent-workflow) for per-consumer checks, scoped fixes, and results. Skills naming `docs/agents/issue-tracker.md` or `docs/agents/triage-labels.md` route to [Tracker Operations](docs/development.md#tracker-operations). Do not create duplicate compatibility files.
- **Package, documentation, or routing changes** - Read [docs/development.md](docs/development.md) for source inspection, public documentation updates, and agent workflow.
- **Develop or validate the demo** - Read [demo/AGENTS.md](demo/AGENTS.md) for ownership, simulation and renderer lifecycle, traversal use, and demo checks. Use [Agent Workflow](docs/development.md#agent-workflow) for shared checks and results.
- **Release or recover** - Read [docs/releasing.md](docs/releasing.md) for authorization, readiness, completion, recovery, and manual ruleset import.

Update this file only for always-loaded authority, hard constraints, or task routing. Put branch-specific policy in its named owner and update affected links together.
