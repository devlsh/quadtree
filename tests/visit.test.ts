import { Quadtree, type Rect } from '../src/index';

describe('Quadtree.visit', () => {
  it('should visit actual nodes in depth-first order with caller-owned bounds across rebuilds', () => {
    const bounds: Rect = {
      x: 10,
      y: 20,
      width: 80,
      height: 40,
    };

    const tree = new Quadtree<Rect>({
      ...bounds,
      maxDepth: 2,
      maxObjects: 1,
    });

    const visited: Rect[] = [];

    tree.visit((node) => {
      visited.push(node);
    });
    expect(visited).toEqual([bounds]);

    const first: Rect = {
      x: 12,
      y: 22,
      width: 1,
      height: 1,
    };

    const second: Rect = {
      x: 14,
      y: 24,
      width: 1,
      height: 1,
    };

    tree.insert(first);
    visited.length = 0;
    tree.visit((node) => {
      visited.push(node);
    });
    expect(visited).toEqual([bounds]);

    tree.insert(second);

    const topLeft: Rect = {
      x: 10,
      y: 20,
      width: 40,
      height: 20,
    };

    const topRight: Rect = {
      x: 50,
      y: 20,
      width: 40,
      height: 20,
    };

    const bottomLeft: Rect = {
      x: 10,
      y: 40,
      width: 40,
      height: 20,
    };

    const bottomRight: Rect = {
      x: 50,
      y: 40,
      width: 40,
      height: 20,
    };

    const expected: Rect[] = [
      bounds,
      topLeft,
      {
        x: 10,
        y: 20,
        width: 20,
        height: 10,
      },
      {
        x: 30,
        y: 20,
        width: 20,
        height: 10,
      },
      {
        x: 10,
        y: 30,
        width: 20,
        height: 10,
      },
      {
        x: 30,
        y: 30,
        width: 20,
        height: 10,
      },
      topRight,
      bottomLeft,
      bottomRight,
    ];

    visited.length = 0;
    tree.visit((node) => {
      visited.push(node);
    });
    expect(visited).toEqual(expected);
    expect(new Set(visited).size).toBe(expected.length);
    const retained = [...visited];

    visited.length = 0;
    tree.visit((node) => {
      visited.push({ ...node });
      node.x = -100;
      node.y = -100;
      node.width = 0;
      node.height = 0;
    });
    expect(visited).toEqual(expected);
    expect(retained).toEqual(expected);
    expect(tree.retrieve(first)).toContain(first);

    const failure = new Error('visitor failed');
    let caught: unknown;
    visited.length = 0;

    try {
      tree.visit((node) => {
        visited.push(node);

        if (visited.length === 2) {
          throw failure;
        }
      });
    } catch (error) {
      caught = error;
    }

    expect(caught).toBe(failure);
    expect(visited).toEqual([bounds, topLeft]);

    tree.clear();
    visited.length = 0;
    tree.visit((node) => {
      visited.push(node);
    });
    expect(visited).toEqual([bounds]);

    first.x = 72;
    first.y = 52;
    second.x = 74;
    second.y = 54;
    tree.insertAll([first, second]);
    visited.length = 0;
    tree.visit((node) => {
      visited.push(node);
    });
    expect(visited).toEqual([
      bounds,
      topLeft,
      topRight,
      bottomLeft,
      bottomRight,
      {
        x: 50,
        y: 40,
        width: 20,
        height: 10,
      },
      {
        x: 70,
        y: 40,
        width: 20,
        height: 10,
      },
      {
        x: 50,
        y: 50,
        width: 20,
        height: 10,
      },
      {
        x: 70,
        y: 50,
        width: 20,
        height: 10,
      },
    ]);

    const unsplit = new Quadtree<Rect>({
      ...bounds,
      maxDepth: 0,
      maxObjects: 1,
    });

    unsplit.insertAll([first, second]);
    visited.length = 0;
    unsplit.visit((node) => {
      visited.push(node);
    });
    expect(visited).toEqual([bounds]);
  });
});
