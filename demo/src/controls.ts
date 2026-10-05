import { GUI } from 'lil-gui';
import { defaults, limits, type Config } from './config';

interface Actions {
  reset: () => void;
  change: () => void;
  structure: () => void;
  bounds: () => void;
}

function number(value: number, min: number, max: number, fallback: number) {
  return Number.isFinite(value) ? Math.max(min, Math.min(max, value)) : fallback;
}

/**
 * Mutates the shared config, clamps numeric input, and queues coordinator work.
 * The caller destroys the returned GUI before disposing the simulation.
 */
export function createControls(config: Config, actions: Actions) {
  const gui = new GUI();

  const simulation = gui.addFolder('Simulation');
  simulation.add(config, 'playing').name('Playing');
  simulation.add(config, 'speed', 0, limits.speed, 0.05).name('Speed');
  simulation.add(config, 'count', 0, limits.count, 1).name('Entities');

  const subdivision = gui.addFolder('Quadtree');
  subdivision.add(config, 'maxObjects', 1, 32, 1).name('Max Objects');
  subdivision.add(config, 'maxDepth', 0, limits.depth, 1).name('Max Depth');

  const bounds = gui.addFolder('World');
  bounds.add(config, 'width', 320, 1600, 10).name('Width');
  bounds.add(config, 'height', 320, 1600, 10).name('Height');

  simulation.add({ reset: actions.reset }, 'reset').name('Respawn');

  gui.onChange(() => {
    config.width = Math.round(number(config.width, 320, 1600, defaults.width));
    config.height = Math.round(number(config.height, 240, 1200, defaults.height));
    config.maxObjects = Math.round(number(config.maxObjects, 1, 32, defaults.maxObjects));
    config.maxDepth = Math.round(number(config.maxDepth, 0, limits.depth, defaults.maxDepth));
    config.count = Math.round(number(config.count, 0, limits.count, defaults.count));
    config.speed = number(config.speed, 0, limits.speed, defaults.speed);
    actions.change();

    for (const controller of gui.controllersRecursive()) {
      controller.updateDisplay();
    }
  });

  // Structural controls are coalesced at the next frame, even while paused.
  subdivision.onChange(actions.structure);
  bounds.onChange(actions.bounds);

  return gui;
}
