# Development

## Change Workflow

1. Read [CONTRIBUTING.md](../CONTRIBUTING.md) for setup, dependency approval, standard checks, and PR procedure.
2. Identify each affected consumer using the source map below. Inspect its implementation, tests, configuration, and public usage before editing. Follow nearby code patterns and configured lint and format rules.
3. Apply the relevant validation requirements below, in addition to the standard checks. Scope automatic fixes and formatting to authorized files.
4. Report changed behavior, checks actually run and their results, and omitted or blocked checks with reasons. Distinguish local evidence from hosted or installed-consumer evidence.

## Source And Consumer Map

| Change                                     | Source and contract to inspect                                                                                                                                                                                |
| ------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Library behavior or types                  | [src/index.ts](../src/index.ts), [src/types.ts](../src/types.ts), [tests](../tests), and [README usage](../README.md#usage)                                                                                   |
| Build or package contents                  | [tsdown.config.ts](../tsdown.config.ts), exports/files/lifecycle scripts in [package.json](../package.json), and README consumer examples                                                                     |
| Demo behavior or rendering                 | [demo/AGENTS.md](../demo/AGENTS.md), its source owners, and the [public demo guide](../demo/README.md)                                                                                                        |
| Shared tooling or dependency configuration | Root and [demo manifests](../demo/package.json), [pnpm-workspace.yaml](../pnpm-workspace.yaml), TypeScript configurations, [oxlint.config.ts](../oxlint.config.ts), and [oxfmt.config.ts](../oxfmt.config.ts) |
| Validation or deployment workflows         | [.github/workflows](../.github/workflows), the pinned shared setup action, and [Releasing](releasing.md) for release effects                                                                                  |

- The library has no runtime dependencies. Its public package exposes one ESM entrypoint with declarations; `dist` is generated.
- Library tests import the public source entrypoint. The demo also consumes library source, not the built or installed package. Neither proves the published module layout.
- Root TypeScript checks cover library source, tests, and root configurations. Demo browser source and Vite configuration have separate checks.

## Validation Requirements

Select focused checks from [package.json](../package.json) during development. Complete the [standard checks](../CONTRIBUTING.md#checks) before closeout. Add evidence for each affected consumer:

| Affected surface                                 | Required evidence                                                                                                                                                                           |
| ------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Library behavior                                 | Exercise affected insertion, subdivision, retrieval, bounds, duplicates, and clear/rebuild through the public consumer seam. Assert collision candidates, not exact collisions.             |
| `visit` traversal                                | Verify actual-node pre-order, empty leaves, fresh caller-owned bounds, exception propagation, and clear/rebuild.                                                                            |
| Demo behavior or library behavior consumed by it | Follow the [scoped checks](../demo/AGENTS.md#checks). Library checks do not replace demo checks.                                                                                            |
| Module exports or build output                   | Build, then pack and install into an isolated consumer. Verify affected ESM imports, declarations, and package contents. Source-local tests and the demo do not prove installed resolution. |
| Shared action or workflow                        | Check inputs, outputs, and caller compatibility. Local package checks do not execute GitHub Actions; report hosted execution as unverified unless an authorized run covers the change.      |
| Documentation                                    | Check Markdown paths, anchors, and audience boundaries. Run `pnpm fmt <changed-files>`, `pnpm fmt:check`, and `pnpm check`. Docs-only work needs no independent code review.                |

`pnpm check` does not run Vitest, package builds, demo typechecks, or demo builds. Vitest covers library behavior, not the canvas interface. The formatter excludes `.github`; a passing check does not validate those files.

## Documentation Ownership

- Keep always-loaded authorization, repository defaults, and task routes in [AGENTS.md](../AGENTS.md). Keep demo-specific ownership, simulation, rendering, lifecycle, and real-interface checks in [demo/AGENTS.md](../demo/AGENTS.md).
- Keep shared contributor procedures in CONTRIBUTING and release operations in [Releasing](releasing.md). Link to the owner instead of copying its procedure.
- Keep public library behavior and examples in the root README and public demo controls in the demo README. Update affected examples when behavior or scope changes.
- When instructions change, update affected routes and remove obsolete guidance in the same change. Verify the complete `**/AGENTS.md` set, local paths and anchors, and documented claims against executable owners.
- Check incoming links from human documentation against the audience boundary in [AGENTS.md](../AGENTS.md#repository-defaults).

## Tracker Operations

- Resolve the exact hosted repository from [package.json](../package.json) and the requested object before acting.
- Follow [Questions And Reports](../CONTRIBUTING.md#questions-and-reports) for support, issue search, and private security reports.
- Read current hosted labels before applying them. Configuration files and old reports do not establish current hosted state.
- Skills naming `docs/agents/issue-tracker.md` or `docs/agents/triage-labels.md` route here. Maintain this owner rather than creating duplicate compatibility files.
