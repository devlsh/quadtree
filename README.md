<p align="center">
  <h1 align="center">@devlsh/quadtree</h1>
  <p align="center">A lightweight TypeScript quadtree for spatial indexing.</p>
</p>

<br />

<p align="center">
  <a href="https://www.npmjs.com/package/@devlsh/quadtree" rel="nofollow">
    <img src="https://img.shields.io/npm/dm/%40devlsh%2Fquadtree?style=flat-square" alt="NPM Downloads" />
  </a>
  <a href="https://github.com/devlsh/quadtree/stargazers" rel="nofollow">
    <img src="https://img.shields.io/github/stars/devlsh/quadtree?style=flat-square" alt="GitHub Stars" />
  </a>
  <a href="https://github.com/devlsh/quadtree/actions/workflows/validate.yml" rel="nofollow">
    <img src="https://img.shields.io/github/actions/workflow/status/devlsh/quadtree/validate.yml?style=flat-square" alt="Build Status" />
  </a>
  <a href="https://github.com/devlsh/quadtree/blob/main/LICENSE" rel="nofollow">
    <img src="https://img.shields.io/github/license/devlsh/quadtree?style=flat-square" alt="Software License" />
  </a>
</p>

<br />

- [Interactive demo](https://quadtree.devlsh.com).
- TypeScript generics for custom object types.
- Single-object and batch insertion.
- Configurable bounds, tree depth, and subdivision thresholds.
- Spatial queries for collision candidates.
- Zero runtime dependencies.

> Not sure what a quadtree is or why it helps? Check out ["What are quadtrees"](https://www.youtube.com/watch?v=-OLQlDHCMgM) on YouTube.

<br />

## Installation

```bash
$ npm install @devlsh/quadtree
```

## Usage

```ts
import { Quadtree, type Rect } from '@devlsh/quadtree';

/**
 * If you want custom data (such as an ID) attached to objects, you can pass in a
 * generic based on `Rect`.
 */
interface Entity extends Rect {
  id: string;
}

const tree = new Quadtree<Entity>({
  width: 1024, // World/canvas width.
  height: 1024, // World/canvas height.
  maxDepth: 12, // Limit how many times regions subdivide.
  maxObjects: 15, // Split crowded regions into four; not a hard cap at maxDepth.
});

const object: Entity = {
  id: 'object-1',
  x: 489,
  y: 200,
  width: 20,
  height: 20,
};

const others: Entity[] = [
  { id: 'object-2', x: 460, y: 190, width: 20, height: 20 },
  { id: 'object-3', x: 1000, y: 1000, width: 20, height: 20 },
];

tree.insert(object);
tree.insertAll(others);

/**
 * Candidates are not exact collisions - they are neighboring spatial objects.
 * Retrieval returns each original reference at most once, even across child boundaries.
 * Distinct objects with equal bounds remain separate candidates. TODO: fix this.
 * Apply your own collision check afterward.
 */
const candidates = tree.retrieve({ x: 480, y: 180, width: 100, height: 100 });

/**
 * No update/remove methods: after moving objects, clear and reinsert all current objects.
 */
object.x = 600;
tree.clear();
tree.insertAll([object, ...others]);
```

## Contributing

Report bugs through [issues](https://github.com/devlsh/quadtree/issues) or ask questions in [Discussions](https://github.com/devlsh/quadtree/discussions). Report vulnerabilities privately as described in [SECURITY.md](SECURITY.md).

For local development, pull requests, and other contributions, see the [Contributing Guidelines](CONTRIBUTING.md).

## License

`@devlsh/quadtree` is free and open-source software licensed under the [MIT License](LICENSE).

---

> [devlsh.com](https://devlsh.com) &nbsp;&middot;&nbsp;
> GitHub: [@devlsh](https://github.com/devlsh) &nbsp;&middot;&nbsp;
> X: [@itsdevlsh](https://x.com/itsdevlsh)
