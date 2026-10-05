import { type Container, type Rectangle } from 'pixi.js';
import { type Rect } from '../../src';
import { type Config } from './config';

/**
 * Fits the world and retains client pointer coordinates independently of its transform.
 * Usage: pass force after bounds changes; a true result requires rebuilding strokes.
 * Destroy before removing the canvas to release DOM listeners.
 */
export function createViewport(config: Config, world: Container, screen: Rectangle, canvas: HTMLCanvasElement) {
  const padding = 24;
  let viewWidth = 0;
  let viewHeight = 0;
  let pointer: { x: number; y: number } | undefined;

  function track(event: PointerEvent) {
    pointer = {
      x: event.clientX,
      y: event.clientY,
    };
  }

  function leave() {
    pointer = undefined;
  }

  canvas.addEventListener('pointerenter', track);
  canvas.addEventListener('pointermove', track);
  canvas.addEventListener('pointerleave', leave);
  canvas.addEventListener('pointercancel', leave);
  window.addEventListener('blur', leave);

  /**
   * Maps the retained client position afresh after fitting, including stationary-pointer resizes.
   * Usage: call after fit each tick; absence means no pointer inside the canvas.
   */
  function point(): Rect | undefined {
    if (!pointer) {
      return;
    }

    const bounds = canvas.getBoundingClientRect();
    const x = pointer.x - bounds.left;
    const y = pointer.y - bounds.top;

    if (bounds.width <= 0 || bounds.height <= 0 || x < 0 || y < 0 || x > bounds.width || y > bounds.height) {
      return;
    }

    return {
      x: ((x * screen.width) / bounds.width - world.x) / world.scale.x,
      y: ((y * screen.height) / bounds.height - world.y) / world.scale.y,
      width: 0,
      height: 0,
    };
  }

  function destroy() {
    canvas.removeEventListener('pointerenter', track);
    canvas.removeEventListener('pointermove', track);
    canvas.removeEventListener('pointerleave', leave);
    canvas.removeEventListener('pointercancel', leave);
    window.removeEventListener('blur', leave);
    leave();
  }

  function fit(force: boolean) {
    if (!force && viewWidth === screen.width && viewHeight === screen.height) {
      return false;
    }

    viewWidth = screen.width;
    viewHeight = screen.height;

    const scale = Math.min(
      Math.max(1, screen.width - padding * 2) / config.width,
      Math.max(1, screen.height - padding * 2) / config.height,
    );

    world.scale.set(scale);
    world.position.set((screen.width - config.width * scale) / 2, (screen.height - config.height * scale) / 2);

    return true;
  }

  return {
    fit,
    point,
    destroy,
  };
}
