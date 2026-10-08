# Quadtree Demo

This file owns demo-specific agent guidance. Use [Development](../docs/development.md) and [Agent Workflow](../docs/development.md#agent-workflow) alongside it.

## Owners And Scope

- [index.html](index.html) and [src/style.css](src/style.css) own the fullscreen canvas host. The interface is the canvas and floating lil-gui only. Preserve this direction without panels or explanatory UI.
- [src/index.ts](src/index.ts) owns startup and the AbortController used for HMR disposal. [src/init.ts](src/init.ts) owns asynchronous Pixi initialization, domain composition, frame ordering, and idempotent cleanup.
- [src/controls.ts](src/controls.ts) owns GUI ranges, numeric clamping, and actions that notify the coordinator.
- [src/simulation.ts](src/simulation.ts) owns indexed entities, the retained body pool, scattering, bounds synchronization, movement, and candidate tints. [src/tree.ts](src/tree.ts) owns tree construction/recreation, insertion, visual positioning, actual-node outlines, and hover retrieval. These domains consume library source through `../../src`, not generated package output.
- [src/viewport.ts](src/viewport.ts) owns viewport-size tracking and world fit independently of simulation bounds. It also owns retained DOM pointer input, coordinate mapping, and listener cleanup.
- [../.github/workflows/demo.yml](../.github/workflows/demo.yml) separates credential-free validation from main-only deployment using the `production` environment. The local workflow does not prove hosted environment protection. Local work does not authorize live operations.

Refresh this guidance when these executable owners change commands, consumers, controls, simulation behavior, or lifecycle.

## Simulation And Rendering

Keep indexed entities exactly `Rect & { id: number }`. Velocities and retained Pixi visuals belong to the separate body pool. A count decrease hides inactive visuals. A count increase reuses the pool before it allocates new bodies. Share the rectangle graphics context and retain visuals across frames.

The GUI controls playing, speed, entity count, `maxObjects`, `maxDepth`, world width/height, and resetting positions. Each mounted demo shares one mutable settings object across its domains. The quadtree root uses fixed `x = 0`, `y = 0`, and `level = 0`. These are not GUI settings. Structural settings recreate the tree on the next frame, including while paused. Count changes and resets also update while paused.

Controls queue coordinator flags rather than rebuilding directly. Keep frame work ordered:

1. Replace the tree when structural settings change.
2. Synchronize the pool when dirty.
3. Fit the viewport when needed.
4. Move active entities when playing with positive speed.
5. Rebuild when dirty, passing the retained pool without allocating an active-body array each frame.
6. Retrieve hover candidates and refresh tints every tick, including while paused.

On changed frames, clear the tree and reinsert active entities before drawing outlines through `visit`. Draw existing nodes, including empty leaves, rather than a synthetic depth grid. The `Quadtree.visit` declaration in [src/index.ts](../src/index.ts) owns the traversal contract for callback ownership and ordering. Use bounds copies without mutating the tree inside the callback. Verify affected traversal behavior at the [library consumer seam](../docs/development.md#agent-workflow).

Resize fits and centers the simulation world in the viewport. It does not change simulation bounds. World dimension controls change bounds and trigger refitting. Keep canvas sizing and world coordinates separate.

Map retained client pointer coordinates through the current canvas bounding rectangle, logical renderer dimensions, and inverse world fit each tick. Retrieve with a zero-sized world rectangle only inside inclusive world bounds.

- Highlight broad candidates without exact-intersection filtering. Retrieval returns unique original references.
- Restore inactive pooled tints as well as active ones.
- Outline the deepest actual node containing the point. The first pre-order node wins equal-size boundary ties.
- Keep all four highlighted sides above ordinary outlines.
- Clear hover input on pointer leave, cancellation, and window blur.

## Lifecycle Safety

Retain the abort owner for the mounted demo. If aborted during asynchronous Pixi initialization, destroy the application before attaching its canvas.

Dispose in this order:

1. Remove the ticker callback and viewport listeners.
2. Destroy the GUI and clear the tree.
3. Destroy pooled visuals without their borrowed context.
4. Destroy both outline graphics and the application/canvas.
5. Release the shared context.

Keep disposal idempotent so HMR leaves one canvas, GUI, and simulation owner.

## Checks

Use [Local Development](../CONTRIBUTING.md#local-development) for setup and [Dependency Changes](../CONTRIBUTING.md#dependency-changes) for version approval. From the repository root, the manifests define:

- `pnpm demo dev` starts Vite for real-interface checks.
- `pnpm demo typecheck` checks browser source and Vite configuration without emitting files.
- `pnpm demo build` builds the demo with Vite.
- `pnpm demo wrangler deploy --dry-run` validates native deployment packaging without deploying. Run it after `pnpm demo build` exactly as shown, without environment wrappers or additional environment variables. Build and dry-run validate packaging, not runtime HTTP behavior. Local checks do not verify custom-domain ownership, DNS, secrets, or environment protection.

Select these checks with [Agent Workflow](../docs/development.md#agent-workflow) for every affected consumer. For behavior changes, inspect the live interface for affected movement, bounce, pause/speed zero, count zero, and pool reuse. Include affected settings/reset while paused, actual node outlines, viewport/world resize behavior, and HMR cleanup.

Make sure that affected controls and lifecycle behave as described. Report each executed check and any gap. If startup or checks fail, resolve the failure at its executable owner or report the blocker. Static checks alone do not prove canvas behavior.

Demo checks are separate from library typechecking, tests, and packaging. When changing the library API consumed here, verify both owning seams.
