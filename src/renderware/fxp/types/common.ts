export interface FxKeyframe {
  time: number;
  value: number;
}

export interface FxInterpData {
  looped: boolean;
  keys: FxKeyframe[];
}

export interface FxMatrix {
  right: { x: number; y: number; z: number };
  up: { x: number; y: number; z: number };
  at: { x: number; y: number; z: number };
  pos: { x: number; y: number; z: number };
}

export interface FxBoundingSphere {
  x: number;
  y: number;
  z: number;
  radius: number;
}
