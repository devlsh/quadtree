# Releasing

Before release or recovery work, read [release.yml](../.github/workflows/release.yml), [release.json](../release.json), and [.manifest.json](../.manifest.json). Use [CONTRIBUTING](../CONTRIBUTING.md) for checks and pull request review.

Get explicit authorization for each requested hosted inspection, change, release dispatch, publication, or repair before you act.

- **Readiness:** Verify hosted permissions, required-check behavior, npm trusted publishing for `@devlsh/quadtree`, and registry state within the authorized scope. Report unresolved prerequisites before dispatch.
- **Completion:** Inspect the complete run. Compare the reviewed version and source commit with the GitHub release/tag and npm version/dist-tag state. Verify published tarball identity separately from registry metadata. Release labels and manifest versions alone do not prove publication.
- **Recovery:** After a partial or ambiguous failure, inspect the exact release, source commit, and published package identity before a retry. A fresh dispatch does not resume npm publication for an existing GitHub release. A run retry does not replace registry inspection after an ambiguous failure. Get approval for the specific repair, including any unpublishing or version-tag change.

After an authorized manual import of the [ruleset files](../.github/rulesets), review the hosted settings and verify enforcement. File changes need a new import or a hosted edit to take effect.
