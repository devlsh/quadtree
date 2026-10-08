# Contributing

Read the [Code of Conduct](CODE_OF_CONDUCT.md) before you participate.

## Questions And Reports

Use [GitHub Discussions](https://github.com/devlsh/quadtree/discussions) for questions and support. Use [Issues](https://github.com/devlsh/quadtree/issues) for bugs and feature requests. Report vulnerabilities privately as described in [SECURITY.md](SECURITY.md).

Search open and closed issues first. Add details to a matching report, or open a new report. Include reproduction steps, expected and actual behavior, and environment details.

## Local Development

Install [Nix](https://nix.dev/) and [devenv](https://devenv.sh/), then clone the repository.

From the repository root, install dependencies with the frozen lockfile and install Git hooks:

```sh
devenv tasks run quadtree:install
```

Enter the development shell before you run the pnpm commands below:

```sh
devenv shell
```

If you use [direnv](https://direnv.net/), run `direnv allow .` instead of `devenv shell`.

## Dependency Changes

Ask the maintainer to approve dependency versions before you add or update them. Include the manifest, lockfile, and related script or configuration changes in the same PR.

## Checks

Run root typecheck, lint, and format checks:

```sh
pnpm check
```

`pnpm check` does not run Vitest, demo typecheck, or builds. Use `pnpm build` when you need generated package output.

Apply automatic lint fixes, then format the files:

```sh
pnpm lint:fix
pnpm fmt
```

Inspect the diff, correct remaining findings, and rerun `pnpm check` until it passes. For documentation changes, examine local links and anchors too.

Run `pnpm test` for the Vitest suite. For behavior changes, add or update tests at the public consumer seam and describe the results. Static checks alone do not prove runtime behavior. `pnpm test:coverage` reports coverage for library source in `src/**/*.ts`.

For demo changes, run these additional checks from the repository root:

```sh
pnpm demo typecheck
pnpm demo build
```

For demo behavior changes, run `pnpm demo dev` and inspect affected controls, pointer queries, resize behavior, and cleanup in the browser. Refer to the [demo guide](demo/README.md) for its controls. Library checks do not replace demo checks.

## Pull Requests

Search current issues and PRs first. Keep changes focused, and update affected tests and usage examples.

- Open a PR against `main` with the [PR template](.github/PULL_REQUEST_TEMPLATE.md). Use a Conventional Commit title for release-relevant changes.
- Explain the change, link related issues, and identify breaking changes or areas that need review.
- List checks run and their results. Explain omitted tests or blocked checks.
- Use a draft for unfinished work. Request final review after local and required CI checks pass and you resolve blocking findings.
- If you use AI, write the description in your own words and explain how you reviewed its code and decisions.
