export const limits = {
  count: 1000,
  speed: 6,
  depth: 8,
};

export const colors = {
  background: 0xd4b5f1,
  node: 0x350f55,
  root: 0x350f55,
  candidate: 0xfff0a6,
  hoveredNode: 0xb84413,
  entities: [0x8854b0, 0x9567ba, 0xa575cc],
};

export const defaults = {
  playing: true,
  width: 850,
  height: 850,
  maxObjects: 8,
  maxDepth: 4,
  count: 120,
  speed: 1,
};

export type Config = typeof defaults;
