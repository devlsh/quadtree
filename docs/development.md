# Development

Use [CONTRIBUTING.md](../CONTRIBUTING.md) for setup, dependency changes, checks, and pull requests. For release or recovery work, read [Releasing](releasing.md).

Before you edit, inspect [package.json](../package.json), the affected implementation and tests, and their configuration. Use nearby code patterns and the configured lint and format rules.

## Documentation

When public behavior or scope changes, update affected [README examples](../README.md#usage) and the [demo guide](../demo/README.md) where relevant. For instruction or routing changes, update affected pointers together.

## Agent Workflow

Select checks from [CONTRIBUTING](../CONTRIBUTING.md#checks) and [package.json](../package.json) for every affected consumer. Include behavior checks for these cases:

- For library changes, exercise affected insertion, subdivision, retrieval, bounds, duplicates, and clear/rebuild at the public consumer seam. Assert collision candidates, not exact collisions. For affected `visit` traversal, verify actual-node pre-order, empty leaves, fresh caller-owned bounds, exception propagation, and clear/rebuild.
- For demo changes, include the [scoped checks](../demo/AGENTS.md#checks). Library checks do not replace demo checks.
- When exports or output change, run `pnpm build` and verify affected built consumer imports and declarations.
- For documentation changes, examine Markdown paths, anchors, and audience boundaries. Run `pnpm fmt <changed-files>`, `pnpm fmt:check`, and `pnpm check`. Docs-only work needs no independent code review.

Scope automatic fixes and format commands to authorized files. Report changed files, check results, and omitted or blocked checks with their reasons.

### Tracker Operations

For tracker work, resolve the exact hosted repository and use [Questions And Reports](../CONTRIBUTING.md#questions-and-reports). Examine current hosted labels before you apply them.
