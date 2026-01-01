import type { FxBoundingSphere, FxMatrix } from "./common";
import type { FxInfo } from "./info";

export interface FxEmitterBP {
  name: string;
  matrix: FxMatrix;
  textures: (string | null)[];
  alphaOn: boolean;
  srcBlendId: number;
  dstBlendId: number;
  lodStart: number;
  lodEnd: number;
  infos: FxInfo[];
}

export interface FxSystemBP {
  filename: string;
  name: string;
  length: number;
  loopIntervalMin: number;
  loopLength: number;
  playMode: number;
  cullDist: number;
  boundingSphere: FxBoundingSphere | null;
  prims: FxEmitterBP[];
}

export interface FxProject {
  systems: Map<string, FxSystemBP>;
}
