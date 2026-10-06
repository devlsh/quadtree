import { type Options, type Rect } from './types';

/**
 * Indexes rectangle references for spatial candidate queries. Retrieval returns
 * each reference at most once, even when objects span child boundaries.
 *
 * After moving objects, clear the tree and reinsert the current objects to rebuild
 * their spatial placement.
 *
 * @template T - Optional `Rect`-based object with custom metadata.
 */
export class Quadtree<T extends Rect> {
  /**
   * Node-owned region and subdivision settings, copied from construction options.
   */
  private readonly options: Required<Options>;

  /**
   * Owned child nodes in top-left, top-right, bottom-left, bottom-right order;
   * empty until this node subdivides.
   */
  private children: Quadtree<T>[] = [];

  /**
   * Original object references stored locally in a leaf, redistributed to children
   * and released from this node when it subdivides.
   */
  private objects: T[] = [];

  /**
   * Local stored-reference count used for insertion and the subdivision threshold,
   * not a count of objects in descendants.
   */
  private totalObjects = 0;

  /**
   * Tracks whether insertion and retrieval use children instead of local storage;
   * clearing restores leaf state.
   */
  private isParent = false;

  /**
   * Creates an empty tree for the supplied region and subdivision settings.
   *
   * @param options - Bounds and subdivision settings.
   */
  constructor(options: Options) {
    this.options = {
      level: 0,
      x: 0,
      y: 0,
      ...options,
    };
  }

  /**
   * Retrieves spatial candidates from leaves selected by the query rectangle.
   * Node intersection includes edges and corners. A level-zero root accepts outside
   * queries, but its children and nonzero-level roots require node intersection.
   * Individual objects are not tested for exact intersection with the query.
   *
   * Apply your own collision test. Repeated inserts of the same reference produce
   * one candidate, but distinct objects with equal bounds remain separate.
   *
   * @returns A fresh array of unique original references.
   */
  retrieve(box: Rect): T[] {
    if (!this.isParent) {
      return this.options.level === 0 || this.inside(box) ? [...new Set(this.objects)] : [];
    }

    const objects = new Set<T>();
    this.collect(box, objects);

    return [...objects];
  }

  /**
   * Adds eligible leaf references in encounter order to the query-owned set.
   * Pass the same set through all children without resetting earlier candidates.
   */
  private collect(box: Rect, objects: Set<T>) {
    if (this.options.level !== 0 && !this.inside(box)) {
      return;
    }

    if (this.isParent) {
      for (const child of this.children) {
        child.collect(box, objects);
      }

      return;
    }

    for (const object of this.objects) {
      objects.add(object);
    }
  }

  /**
   * Inserts each object using the same reference and subdivision rules as insert,
   * without modifying the supplied array or cloning its objects.
   */
  insertAll(objects: T[]) {
    for (const object of objects) {
      this.insert(object);
    }
  }

  /**
   * Stores the original object reference in every intersecting child region after
   * subdivision, so objects spanning boundaries can be stored more than once.
   *
   * An insertion splits a leaf before storing the new object when its existing
   * stored count is at least `maxObjects` and its level is below `maxDepth`.
   * `maxObjects` is a subdivision threshold, not a hard storage cap at `maxDepth`.
   *
   * After changing object bounds, clear and reinsert all current objects rather
   * than inserting the changed reference again into the existing tree.
   */
  insert(object: T) {
    if (!this.isParent && this.totalObjects >= this.options.maxObjects && this.options.level < this.options.maxDepth) {
      this.split();
      this.insertAll(this.objects);
      this.objects = [];
      this.totalObjects = 0;
    }

    if (this.isParent) {
      if (this.children[0]?.inside(object)) {
        this.children[0].insert(object);
      }

      if (this.children[1]?.inside(object)) {
        this.children[1].insert(object);
      }

      if (this.children[2]?.inside(object)) {
        this.children[2].insert(object);
      }

      if (this.children[3]?.inside(object)) {
        this.children[3].insert(object);
      }

      return;
    }

    this.objects[this.totalObjects] = object;
    this.totalObjects++;
  }

  /**
   * Removes stored references and child nodes, restoring an empty leaf with the
   * same region and subdivision settings. Referenced objects are not modified.
   *
   * Reinsert current objects to reuse the tree after their bounds change.
   */
  clear() {
    this.children = [];
    this.objects = [];
    this.totalObjects = 0;
    this.isParent = false;
  }

  /**
   * Visits existing nodes synchronously in depth-first, parent-first order,
   * including the root and empty leaves. Children follow top-left, top-right,
   * bottom-left, bottom-right order.
   *
   * Each callback receives a fresh, caller-owned bounds rectangle. Callback
   * exceptions propagate and stop traversal. Mutating the tree during a visit
   * is unsupported; clear or rebuild it before visiting.
   */
  visit(visitor: (bounds: Rect) => void): void {
    const { x, y, width, height } = this.options;

    visitor({
      x,
      y,
      width,
      height,
    });

    for (const child of this.children) {
      child.visit(visitor);
    }
  }

  /**
   * Tests inclusive axis-aligned intersection with this node's region, not full
   * containment. Touching an edge or corner counts as intersection.
   */
  inside(box: Rect) {
    return (
      this.options.x <= box.x + box.width &&
      box.x <= this.options.x + this.options.width &&
      this.options.y <= box.y + box.height &&
      box.y <= this.options.y + this.options.height
    );
  }

  /**
   * Creates four owned child regions at the next level if not already a parent.
   * Does not redistribute local objects or enforce subdivision thresholds.
   * The insertion path must reinsert existing objects and reset local storage
   * after calling this method.
   */
  private split() {
    if (this.isParent) {
      return;
    }

    this.isParent = true;

    const level = this.options.level + 1;
    const width = this.options.width / 2;
    const height = this.options.height / 2;

    this.children[0] = new Quadtree({
      ...this.options,
      level,
      x: this.options.x,
      y: this.options.y,
      width,
      height,
    });

    this.children[1] = new Quadtree({
      ...this.options,
      level,
      x: this.options.x + width,
      y: this.options.y,
      width,
      height,
    });

    this.children[2] = new Quadtree({
      ...this.options,
      level,
      x: this.options.x,
      y: this.options.y + height,
      width,
      height,
    });

    this.children[3] = new Quadtree({
      ...this.options,
      level,
      x: this.options.x + width,
      y: this.options.y + height,
      width,
      height,
    });
  }
}

export type * from './types';
