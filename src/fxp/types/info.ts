import { FxInterpData } from "./common";

export interface FxInfoEmRate {
  type: "emrate";
  rate: FxInterpData;
}

export interface FxInfoEmSize {
  type: "emsize";
  radius: FxInterpData;
  sizeMinX: FxInterpData;
  sizeMaxX: FxInterpData;
  sizeMinY: FxInterpData;
  sizeMaxY: FxInterpData;
  sizeMinZ: FxInterpData;
  sizeMaxZ: FxInterpData;
}

export interface FxInfoEmSpeed {
  type: "emspeed";
  speed: FxInterpData;
  bias: FxInterpData;
}

export interface FxInfoEmDir {
  type: "emdir";
  dirX: FxInterpData;
  dirY: FxInterpData;
  dirZ: FxInterpData;
}

export interface FxInfoEmAngle {
  type: "emangle";
  min: FxInterpData;
  max: FxInterpData;
}

export interface FxInfoEmLife {
  type: "emlife";
  life: FxInterpData;
  bias: FxInterpData;
}

export interface FxInfoEmPos {
  type: "empos";
  x: FxInterpData;
  y: FxInterpData;
  z: FxInterpData;
}

export interface FxInfoEmWeather {
  type: "emweather";
  interp: FxInterpData;
}

export interface FxInfoEmRotation {
  type: "emrotation";
  min: FxInterpData;
  max: FxInterpData;
}

export interface FxInfoNoise {
  type: "noise";
  x: FxInterpData;
  y: FxInterpData;
  z: FxInterpData;
}

export interface FxInfoForce {
  type: "force";
  forceX: FxInterpData;
  forceY: FxInterpData;
  forceZ: FxInterpData;
}

export interface FxInfoFriction {
  type: "friction";
  friction: FxInterpData;
}

export interface FxInfoAttractPt {
  type: "attractpt";
  x: FxInterpData;
  y: FxInterpData;
  z: FxInterpData;
  power: FxInterpData;
}

export interface FxInfoAttractLine {
  type: "attractline";
  x1: FxInterpData;
  y1: FxInterpData;
  z1: FxInterpData;
  x2: FxInterpData;
  y2: FxInterpData;
  z2: FxInterpData;
  power: FxInterpData;
}

export interface FxInfoGroundCollide {
  type: "groundcollide";
  damping: FxInterpData;
  bounce: FxInterpData;
}

export interface FxInfoWind {
  type: "wind";
  interp: FxInterpData;
}

export interface FxInfoJitter {
  type: "jitter";
  x: FxInterpData;
  y: FxInterpData;
  z: FxInterpData;
}

export interface FxInfoRotSpeed {
  type: "rotspeed";
  speed: FxInterpData;
  speedBias: FxInterpData;
  accel: FxInterpData;
  accelBias: FxInterpData;
}

export interface FxInfoFloat {
  type: "float";
  interp: FxInterpData;
}

export interface FxInfoUnderwater {
  type: "underwater";
}

export interface FxInfoColour {
  type: "colour";
  red: FxInterpData;
  green: FxInterpData;
  blue: FxInterpData;
  alpha: FxInterpData;
}

export interface FxInfoSize {
  type: "size";
  sizeX: FxInterpData;
  sizeY: FxInterpData;
  sizeXBias: FxInterpData;
  sizeYBias: FxInterpData;
}

export interface FxInfoSpriteRect {
  type: "spriterect";
  interps: FxInterpData[];
}

export interface FxInfoHeatHaze {
  type: "heathaze";
  interps: FxInterpData[];
}

export interface FxInfoTrail {
  type: "trail";
  interps: FxInterpData[];
}

export interface FxInfoFlat {
  type: "flat";
  rightX: FxInterpData;
  rightY: FxInterpData;
  rightZ: FxInterpData;
  upX: FxInterpData;
  upY: FxInterpData;
  upZ: FxInterpData;
  atX: FxInterpData;
  atY: FxInterpData;
  atZ: FxInterpData;
}

export interface FxInfoDir {
  type: "dir";
  interps: FxInterpData[];
}

export interface FxInfoAnimTexture {
  type: "animtex";
  interps: FxInterpData[];
}

export interface FxInfoColourRange {
  type: "colourrange";
  redMin: FxInterpData;
  redMax: FxInterpData;
  greenMin: FxInterpData;
  greenMax: FxInterpData;
  blueMin: FxInterpData;
  blueMax: FxInterpData;
  alphaMin: FxInterpData;
  alphaMax: FxInterpData;
}

export interface FxInfoSelfLit {
  type: "selflit";
}

export interface FxInfoColourBright {
  type: "colourbright";
  red: FxInterpData;
  green: FxInterpData;
  blue: FxInterpData;
  alpha: FxInterpData;
  brightness: FxInterpData;
}

export interface FxInfoSmoke {
  type: "smoke";
  interps: FxInterpData[];
}

export type FxInfo =
  | FxInfoEmRate
  | FxInfoEmSize
  | FxInfoEmSpeed
  | FxInfoEmDir
  | FxInfoEmAngle
  | FxInfoEmLife
  | FxInfoEmPos
  | FxInfoEmWeather
  | FxInfoEmRotation
  | FxInfoNoise
  | FxInfoForce
  | FxInfoFriction
  | FxInfoAttractPt
  | FxInfoAttractLine
  | FxInfoGroundCollide
  | FxInfoWind
  | FxInfoJitter
  | FxInfoRotSpeed
  | FxInfoFloat
  | FxInfoUnderwater
  | FxInfoColour
  | FxInfoSize
  | FxInfoSpriteRect
  | FxInfoHeatHaze
  | FxInfoTrail
  | FxInfoFlat
  | FxInfoDir
  | FxInfoAnimTexture
  | FxInfoColourRange
  | FxInfoSelfLit
  | FxInfoColourBright
  | FxInfoSmoke;
