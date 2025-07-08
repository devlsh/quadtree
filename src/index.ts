import type { Options, Rect } from './types';

export class Quadtree<T extends Rect> {
  #children: Quadtree<T>[] = [];
  #options: Required<Options>;
  #objects: T[] = [];
  #totalObjects = 0;
  #isParent = false;

  constructor(options: Options) {
    this.#options = {
      level: 0,
      x: 0,
      y: 0,
      ...options,
    };
  }

  retrieve(box: Rect): T[] {
    let objects: T[] = [];

    if (this.#options.level === 0 || this.inside(box)) {
      if (!this.#isParent) {
        objects = [...this.#objects];
      } else {
        objects = [
          ...(this.#children[0]?.retrieve(box) ?? []),
          ...(this.#children[1]?.retrieve(box) ?? []),
          ...(this.#children[2]?.retrieve(box) ?? []),
          ...(this.#children[3]?.retrieve(box) ?? []),
        ];
      }
    }

    return objects;
  }

  insertAll(objects: T[]) {
    for (const object of objects) {
      this.insert(object);
    }
  }

  insert(object: T) {
    if (!this.#isParent && this.#totalObjects >= this.#options.max_objects && this.#options.level < this.#options.max_depth) {
      this.#split();
      this.insertAll(this.#objects);
      this.#objects = [];
      this.#totalObjects = 0;
    }

    if (this.#isParent) {
      if (this.#children[0]?.inside(object)) {
        this.#children[0].insert(object);
      }

      if (this.#children[1]?.inside(object)) {
        this.#children[1].insert(object);
      }

      if (this.#children[2]?.inside(object)) {
        this.#children[2].insert(object);
      }

      if (this.#children[3]?.inside(object)) {
        this.#children[3].insert(object);
      }

      return;
    }

    this.#objects[this.#totalObjects] = object;
    this.#totalObjects++;
  }

  clear() {
    this.#children = [];
    this.#objects = [];
    this.#totalObjects = 0;
    this.#isParent = false;
  }

  inside(box: Rect) {
    return (
      this.#options.x <= box.x + box.width &&
      box.x <= this.#options.x + this.#options.width &&
      this.#options.y <= box.y + box.height &&
      box.y <= this.#options.y + this.#options.height
    );
  }

  #split() {
    if (this.#isParent) {
      return;
    }

    this.#isParent = true;

    const level = this.#options.level + 1;
    const width = this.#options.width / 2;
    const height = this.#options.height / 2;

    this.#children[0] = new Quadtree({
      ...this.#options,
      level,
      x: this.#options.x,
      y: this.#options.y,
      width,
      height,
    });

    this.#children[1] = new Quadtree({
      ...this.#options,
      level,
      x: this.#options.x + width,
      y: this.#options.y,
      width,
      height,
    });

    this.#children[2] = new Quadtree({
      ...this.#options,
      level,
      x: this.#options.x,
      y: this.#options.y + height,
      width,
      height,
    });

    this.#children[3] = new Quadtree({
      ...this.#options,
      level,
      x: this.#options.x + width,
      y: this.#options.y + height,
      width,
      height,
    });
  }
}

export * from './types';
