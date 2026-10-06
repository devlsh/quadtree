import { Quadtree, type Rect } from '../src/index';

interface Entity extends Rect {
  id: string;
  data: { score: number };
}

describe('Quadtree.retrieve', () => {
  // Columns: [root level, maxDepth, outside candidate count].
  // Cover leaf and subdivided roots at level zero and nonzero levels.
  it.each([
    [0, 0, 2],
    [0, 1, 0],
    [1, 1, 0],
    [1, 2, 0],
  ])('should retrieve unique references at level %i and maxDepth %i', (level, maxDepth, outsideCount) => {
    const tree = new Quadtree<Rect>({
      width: 100,
      height: 100,
      level,
      maxDepth,
      maxObjects: 1,
    });

    // Bounds 48..52 cross both split lines at x = 50 and y = 50.
    const spanning = {
      x: 48,
      y: 48,
      width: 4,
      height: 4,
    };

    // Equal geometry must not merge distinct object references.
    const equalBounds = { ...spanning };
    const empty = tree.retrieve(spanning);
    expect(empty).toEqual([]);
    expect(tree.retrieve(spanning)).not.toBe(empty);

    // Repeat each reference deliberately to exercise deduplication within leaves too.
    tree.insertAll([spanning, spanning, equalBounds, equalBounds]);

    // Query the world corner, split edge, and split corner, respectively.
    // Results are broad candidates, not exact intersections. Child boundaries are inclusive.
    for (const [x, y] of [
      [0, 0],
      [50, 0],
      [50, 50],
    ] as const) {
      const query = {
        x,
        y,
        width: 0,
        height: 0,
      };

      const candidates = tree.retrieve(query);
      expect(candidates).toHaveLength(2);
      expect(candidates).toContain(spanning);
      expect(candidates).toContain(equalBounds);

      // Caller mutations of this array must not affect later queries.
      candidates.length = 0;

      const again = tree.retrieve(query);
      expect(again).not.toBe(candidates);
      expect(again).toHaveLength(2);
      expect(again).toContain(spanning);
      expect(again).toContain(equalBounds);
    }

    const outside = {
      x: 200,
      y: 200,
      width: 0,
      height: 0,
    };

    // Only the unsplit level-zero root returns outside candidates without node intersection.
    // Children and nonzero-level roots reject this query.
    const outsideCandidates = tree.retrieve(outside);
    expect(outsideCandidates).toHaveLength(outsideCount);
    expect(tree.retrieve(outside)).not.toBe(outsideCandidates);

    if (outsideCount) {
      expect(outsideCandidates).toContain(spanning);
      expect(outsideCandidates).toContain(equalBounds);
    }
  });

  it('should retrieve spatial candidates by reference and rebuild after objects move', () => {
    const bounds = {
      x: 0,
      y: 0,
      width: 128,
      height: 128,
    };

    const tree = new Quadtree<Entity>({
      ...bounds,
      maxDepth: 3,
      maxObjects: 1,
    });

    const first: Entity = {
      id: 'first',
      x: 8,
      y: 8,
      width: 4,
      height: 4,
      data: { score: 7 },
    };

    const others: Entity[] = [
      {
        id: 'nearby',
        x: 14,
        y: 14,
        width: 4,
        height: 4,
        data: { score: 8 },
      },
      {
        id: 'top-right',
        x: 100,
        y: 8,
        width: 4,
        height: 4,
        data: { score: 9 },
      },
      {
        id: 'bottom-left',
        x: 8,
        y: 100,
        width: 4,
        height: 4,
        data: { score: 10 },
      },
      {
        id: 'bottom-right',
        x: 100,
        y: 100,
        width: 4,
        height: 4,
        data: { score: 11 },
      },
    ];

    const spanning: Entity = {
      id: 'spanning',
      x: 60,
      y: 60,
      width: 8,
      height: 8,
      data: { score: 12 },
    };

    const inserted = [first, ...others, spanning];
    const originalValues = structuredClone(inserted);

    tree.insert(first);
    expect(tree.retrieve(first)).toContain(first);

    tree.insertAll(others);
    tree.insert(spanning);

    const independent = new Quadtree<Entity>({
      ...bounds,
      maxDepth: 0,
      maxObjects: 1,
    });

    independent.insert(first);

    let reentered = false;

    // The getter triggers same-tree and independent-tree queries during the outer call.
    // Each query must keep its own accumulator without interference from nested queries.
    const allCandidates = tree.retrieve({
      ...bounds,
      get x() {
        if (!reentered) {
          reentered = true;
          const nestedCandidates = tree.retrieve(first);
          expect(nestedCandidates).toHaveLength(2);
          expect(nestedCandidates).toContain(first);
          expect(nestedCandidates).toContain(others[0]);
          const separateCandidates = independent.retrieve(bounds);
          expect(separateCandidates).toHaveLength(1);
          expect(separateCandidates).toContain(first);
        }

        return 0;
      },
    });

    expect(reentered).toBe(true);
    expect(allCandidates).toHaveLength(inserted.length);

    for (const entity of inserted) {
      expect(allCandidates).toContain(entity);
    }

    expect(inserted).toEqual(originalValues);

    const nearbyCandidates = tree.retrieve({
      x: 7,
      y: 7,
      width: 12,
      height: 12,
    });

    expect(nearbyCandidates).toContain(first);
    expect(nearbyCandidates).toContain(others[0]);

    for (const distant of others.slice(1)) {
      expect(nearbyCandidates).not.toContain(distant);
    }

    for (const query of [
      {
        x: 61,
        y: 61,
        width: 1,
        height: 1,
      },
      {
        x: 66,
        y: 61,
        width: 1,
        height: 1,
      },
      {
        x: 61,
        y: 66,
        width: 1,
        height: 1,
      },
      {
        x: 66,
        y: 66,
        width: 1,
        height: 1,
      },
    ]) {
      expect(tree.retrieve(query)).toContain(spanning);
    }

    tree.clear();
    expect(tree.retrieve(bounds)).toEqual([]);

    first.x = 100;
    first.y = 100;

    const replacement: Entity = {
      id: 'replacement',
      x: 8,
      y: 8,
      width: 4,
      height: 4,
      data: { score: 13 },
    };

    tree.insertAll([first, replacement]);

    const rebuiltCandidates = tree.retrieve(bounds);
    expect(rebuiltCandidates).toContain(first);
    expect(rebuiltCandidates).toContain(replacement);
    expect(rebuiltCandidates).toHaveLength(2);
    expect(
      tree.retrieve({
        x: 7,
        y: 7,
        width: 12,
        height: 12,
      }),
    ).not.toContain(first);
    expect(
      tree.retrieve({
        x: 99,
        y: 99,
        width: 6,
        height: 6,
      }),
    ).toContain(first);
  });

  it('should retrieve local candidates after subdivision with nonzero root coordinates', () => {
    const tree = new Quadtree<Rect>({
      x: 100,
      y: 50,
      width: 80,
      height: 40,
      maxDepth: 1,
      maxObjects: 1,
    });

    const first: Rect = {
      x: 110,
      y: 55,
      width: 4,
      height: 4,
    };

    const distant: Rect = {
      x: 165,
      y: 80,
      width: 4,
      height: 4,
    };

    tree.insert(first);
    tree.insert(distant);

    const candidates = tree.retrieve({
      x: 109,
      y: 54,
      width: 6,
      height: 6,
    });

    expect(candidates).toContain(first);
    expect(candidates).not.toContain(distant);
  });
});
