import { type Container, Graphics, type GraphicsContext } from 'pixi.js';
import { type Rect } from '../../src';
import { colors, type Config } from './config';

export interface Entity extends Rect {
  id: number;
}

export interface Body {
  entity: Entity;
  vx: number;
  vy: number;
  visual: Graphics;
}

/**
 * Retains bodies across count changes and borrows the rectangle context.
 * Usage: sync before moving or rebuilding; destroy before releasing the context.
 */
export function createSimulation(config: Config, entities: Container, rectangle: GraphicsContext) {
  const pool: Body[] = [];

  function scatter(body: Body) {
    const angle = Math.random() * Math.PI * 2;
    const velocity = 30 + Math.random() * 65;

    body.entity.x = Math.random() * (config.width - body.entity.width);
    body.entity.y = Math.random() * (config.height - body.entity.height);
    body.vx = Math.cos(angle) * velocity;
    body.vy = Math.sin(angle) * velocity;
  }

  /** Hides retained inactive bodies, optionally scatters all bodies, and clamps bounds. */
  function sync(resetRequested: boolean) {
    while (pool.length < config.count) {
      const visual = new Graphics(rectangle);
      const id = pool.length;

      const entity: Entity = {
        id,
        x: 0,
        y: 0,
        width: 6 + Math.random() * 22,
        height: 6 + Math.random() * 22,
      };

      visual.tint = colors.entities[id % colors.entities.length];
      visual.scale.set(entity.width, entity.height);

      const body: Body = {
        entity,
        visual,
        vx: 0,
        vy: 0,
      };

      scatter(body);
      pool.push(body);
      entities.addChild(visual);
    }

    for (const body of pool) {
      body.visual.visible = body.entity.id < config.count;

      if (resetRequested) {
        scatter(body);
      }

      body.entity.x = Math.max(0, Math.min(config.width - body.entity.width, body.entity.x));
      body.entity.y = Math.max(0, Math.min(config.height - body.entity.height, body.entity.y));
    }
  }

  /** Reflects active bodies' overshoot, including multiple crossings, in simulation seconds. */
  function move(seconds: number) {
    for (const body of pool) {
      if (body.entity.id >= config.count) {
        continue;
      }

      const { entity } = body;
      const width = config.width - entity.width;
      const height = config.height - entity.height;
      const x = (((entity.x + body.vx * seconds) % (2 * width)) + 2 * width) % (2 * width);
      const y = (((entity.y + body.vy * seconds) % (2 * height)) + 2 * height) % (2 * height);
      entity.x = x > width ? 2 * width - x : x;
      entity.y = y > height ? 2 * height - y : y;

      if (x > width) {
        body.vx = -body.vx;
      }

      if (y > height) {
        body.vy = -body.vy;
      }
    }
  }

  function destroy() {
    for (const body of pool) {
      body.visual.destroy({ context: false });
    }

    pool.length = 0;
  }

  /**
   * Restores the whole retained pool before tinting broad candidates, including repeated references.
   * Usage: pass fresh retrieval results after rebuilding, or an empty array to clear highlighting.
   */
  function highlight(candidates: Entity[]) {
    for (const body of pool) {
      body.visual.tint = colors.entities[body.entity.id % colors.entities.length];
    }

    for (const entity of candidates) {
      const body = pool[entity.id];

      if (body && entity.id < config.count) {
        body.visual.tint = colors.candidate;
      }
    }
  }

  return {
    pool,
    sync,
    move,
    destroy,
    highlight,
  };
}
