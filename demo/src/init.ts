import { Application, Container, Graphics, GraphicsContext, type Ticker } from 'pixi.js';
import { createControls } from './controls';
import { colors, defaults } from './config';
import { createSimulation } from './simulation';
import { createTree } from './tree';
import { createViewport } from './viewport';

/**
 * Owns the renderer, floating GUI, retained visual pool, and ticker until
 * signal aborts. Aborting during initialization prevents canvas attachment.
 * Usage: retain the AbortController and abort it when this entrypoint is replaced.
 */
export async function init(canvas: HTMLElement, signal: AbortSignal) {
  const app = new Application();

  await app.init({
    resolution: Math.min(globalThis.window?.devicePixelRatio ?? 1, 4),
    backgroundColor: colors.background,
    autoDensity: true,
    roundPixels: true,
    antialias: false,
    autoStart: false,
    resizeTo: window,
  });

  if (signal.aborted) {
    app.destroy({ removeView: true }, { children: true });

    return;
  }

  canvas.appendChild(app.canvas);

  const config = { ...defaults };
  const world = new Container();
  const entities = new Container();
  const outlines = new Graphics();
  const hovered = new Graphics();
  const rectangle = new GraphicsContext().rect(0, 0, 1, 1).fill(0xffffff);

  const simulation = createSimulation(config, entities, rectangle);
  const tree = createTree(config, outlines, hovered);
  const viewport = createViewport(config, world, app.screen, app.canvas);

  let structureChanged = false;
  let resetRequested = false;
  let fitChanged = true;
  let disposed = false;
  let dirty = true;

  world.eventMode = 'none';

  // Keep actual quad boundaries visible even when entities cross them.
  world.addChild(entities, outlines, hovered);
  app.stage.addChild(world);

  const gui = createControls(config, {
    reset() {
      resetRequested = true;
      dirty = true;
    },
    change() {
      dirty = true;
    },
    structure() {
      structureChanged = true;
    },
    bounds() {
      structureChanged = true;
      fitChanged = true;
    },
  });

  function update(ticker: Ticker) {
    if (structureChanged) {
      tree.recreate();
      structureChanged = false;
    }

    if (dirty) {
      simulation.sync(resetRequested);
      resetRequested = false;
    }

    if (viewport.fit(fitChanged)) {
      fitChanged = false;
      dirty = true;
    }

    if (config.playing && config.speed > 0 && config.count > 0) {
      const seconds = (ticker.deltaMS / 1000) * config.speed;
      simulation.move(seconds);
      dirty = true;
    }

    if (dirty) {
      tree.rebuild(simulation.pool, world.scale.x);
      dirty = false;
    }

    simulation.highlight(tree.hover(viewport.point(), world.scale.x));
  }

  function dispose() {
    if (disposed) {
      return;
    }

    disposed = true;

    signal.removeEventListener('abort', dispose);
    app.ticker.remove(update);
    viewport.destroy();
    gui.destroy();
    tree.clear();
    simulation.destroy();
    outlines.destroy({ context: true });
    hovered.destroy({ context: true });
    app.destroy({ removeView: true }, { children: true });
    rectangle.destroy();
  }

  signal.addEventListener('abort', dispose, { once: true });

  simulation.sync(resetRequested);
  viewport.fit(fitChanged);
  fitChanged = false;
  tree.rebuild(simulation.pool, world.scale.x);
  dirty = false;
  app.ticker.add(update);
  app.start();
}
