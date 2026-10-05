import { Quadtree, type Rect } from '../src/index';

interface Entity extends Rect {
  id: string;
  data: { score: number };
}

describe('Quadtree.retrieve', () => {
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

    const allCandidates = tree.retrieve(bounds);

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
    expect(new Set(rebuiltCandidates)).toEqual(new Set([first, replacement]));
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
