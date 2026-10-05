import { Quadtree, type Rect } from '../src/index';

describe('Quadtree capacity', () => {
  it.each([0, 1, 3])('should retain crowded candidates at maxDepth %i beyond maxObjects', (maxDepth) => {
    const tree = new Quadtree<Rect>({
      width: 128,
      height: 128,
      maxDepth,
      maxObjects: 1,
    });

    const objects: Rect[] = [
      {
        x: 10,
        y: 10,
        width: 1,
        height: 1,
      },
      {
        x: 10,
        y: 10,
        width: 1,
        height: 1,
      },
      {
        x: 10,
        y: 10,
        width: 1,
        height: 1,
      },
      {
        x: 10,
        y: 10,
        width: 1,
        height: 1,
      },
    ];

    tree.insertAll(objects);

    const candidates = tree.retrieve({
      x: 10,
      y: 10,
      width: 1,
      height: 1,
    });

    for (const object of objects) {
      expect(candidates).toContain(object);
    }
  });
});
