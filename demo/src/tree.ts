import { type Graphics } from 'pixi.js';
import { Quadtree, type Rect } from '../../src';
import { colors, type Config } from './config';
import { type Body, type Entity } from './simulation';

/**
 * Indexes active pooled entities and projects their positions and actual node bounds.
 * Usage: recreate after structural changes, then rebuild after sync, fit, and movement.
 * The caller clears the index before destroying visuals and owns both outline contexts.
 */
export function createTree(config: Config, outlines: Graphics, hovered: Graphics) {
  let tree = new Quadtree<Entity>(config);
  const nodes: Rect[] = [];

  function recreate() {
    tree = new Quadtree<Entity>(config);
  }

  function clear() {
    tree.clear();
    nodes.length = 0;
    hovered.clear();
  }

  /**
   * Retrieves broad candidates only for an in-world point after rebuilding.
   * Outlines the deepest containing actual node; pre-order wins equal-size edge ties.
   * Usage: call after fit/rebuild every tick, even when the pointer or simulation is idle.
   */
  function hover(point: Rect | undefined, scale: number): Entity[] {
    hovered.clear();

    // The library root accepts every query, so reject letterboxing before retrieval.
    if (!point || point.x < 0 || point.y < 0 || point.x > config.width || point.y > config.height) {
      return [];
    }

    let selected: Rect | undefined;

    for (const node of nodes) {
      if (
        point.x >= node.x &&
        point.x <= node.x + node.width &&
        point.y >= node.y &&
        point.y <= node.y + node.height &&
        (!selected || node.width < selected.width)
      ) {
        selected = node;
      }
    }

    if (selected) {
      hovered.rect(selected.x, selected.y, selected.width, selected.height).stroke({
        width: 3 / scale,
        color: colors.hoveredNode,
      });
    }

    return tree.retrieve(point);
  }

  function rebuild(pool: Body[], scale: number) {
    let isRoot = true;

    tree.clear();

    for (const body of pool) {
      if (body.entity.id < config.count) {
        tree.insert(body.entity);
        body.visual.position.set(body.entity.x, body.entity.y);
      }
    }

    outlines.clear();
    nodes.length = 0;

    tree.visit((rect) => {
      nodes.push(rect);

      if (isRoot) {
        isRoot = false;

        return;
      }

      outlines.rect(rect.x, rect.y, rect.width, rect.height);
    });

    outlines.stroke({
      width: 2 / scale,
      color: colors.node,
    });

    outlines.rect(0, 0, config.width, config.height).stroke({
      width: 3 / scale,
      color: colors.root,
    });
  }

  return {
    recreate,
    clear,
    rebuild,
    hover,
  };
}
