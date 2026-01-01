import type {
  RwColor,
  RwMatrix3,
  RwMatrix4,
  RwSphere,
  RwTextureCoordinate,
  RwTriangle,
  RwVector2,
  RwVector3,
} from "../common/types";
import type { DffModelType } from "./dff-model-type";

export interface RwDff {
  modelType: DffModelType;
  version: string;
  versionNumber: number;
  geometryList: RwGeometryList | null;
  frameList: RwFrameList | null;
  atomics: number[];
  dummies: string[];
  animNodes: RwAnimNode[];
}

export interface RwClump {
  atomicCount: number;
  lightCount?: number;
  cameraCount?: number;
}

export interface RwAnimNode {
  boneId: number;
  bonesCount: number;
  bones: RwBone[];
}

export interface RwBone {
  boneId: number;
  boneIndex: number;
  flags: number;
}

export interface RwFrame {
  rotationMatrix: RwMatrix3;
  coordinatesOffset: RwVector3;
  parentFrame: number;
}

export interface RwFrameList {
  frameCount: number;
  frames: RwFrame[];
}

export interface RwTexture {
  textureFiltering: number;
  uAddressing: number;
  vAddressing: number;
  usesMipLevels: boolean;
  textureName: string;
}

export interface RwMaterial {
  color: RwColor;
  isTextured: boolean;
  ambient?: number;
  specular?: number;
  diffuse?: number;
  texture?: RwTexture;
}

export interface RwMaterialList {
  materialInstanceCount: number;
  materialData: RwMaterial[];
}

export interface RwGeometry {
  vertexColorInformation: RwColor[];
  textureCoordinatesCount: number;
  textureMappingInformation: RwTextureCoordinate[][];
  hasVertices: boolean;
  hasNormals: boolean;
  isTriangleStrip: boolean;
  triangleInformation: RwTriangle[];
  vertexInformation: RwVector3[];
  normalInformation: RwVector3[];
  boundingSphere?: RwSphere;
  materialList: RwMaterialList;
  binMesh?: RwBinMesh;
  skin?: RwSkin;
  effects2d?: Rw2dEffect[];
  extraVertColour?: RwColor[];
}

export interface RwGeometryList {
  geometricObjectCount: number;
  geometries: RwGeometry[];
}

export interface RwAtomic {
  frameIndex: number;
  geometryIndex: number;
  flags: number;
}

export interface RwBinMesh {
  meshCount: number;
  meshes: RwMesh[];
}

export interface RwSkin {
  boneCount: number;
  usedBoneCount: number;
  maxWeightsPerVertex: number;
  boneVertexIndices: number[][];
  vertexWeights: number[][];
  inverseBoneMatrices: RwMatrix4[];
}

export interface RwMesh {
  materialIndex: number;
  indexCount: number;
  indices: number[];
}

export enum Rw2dEffectType {
  LIGHT = 0,
  PARTICLE = 1,
  ATTRACTOR = 3,
  SUN_GLARE = 4,
  INTERIOR = 5,
  ENEX = 6,
  ROADSIGN = 7,
  TRIGGER_POINT = 8,
  COVER_POINT = 9,
  ESCALATOR = 10,
}

export enum Rw2dCoronaFlashType {
  DEFAULT = 0,
  RANDOM = 1,
  RANDOM_WHEN_WET = 2,
  ANIM_SPEED_4X = 3,
  ANIM_SPEED_2X = 4,
  ANIM_SPEED_1X = 5,
  TRAFFICLIGHT = 7,
  TRAINCROSSING = 8,
  ONLY_RAIN = 10,
  FIVE_ON_FIVE_OFF = 11,
  SIX_ON_FOUR_OFF = 12,
  FOUR_ON_SIX_OFF = 13,
}

export enum RwPedAttractorType {
  ATM = 0,
  SEAT = 1,
  STOP = 2,
  PIZZA = 3,
  SHELTER = 4,
  TRIGGER_SCRIPT = 5,
  LOOK_AT = 6,
  SCRIPTED = 7,
  PARK = 8,
  STEP = 9,
}

export interface Rw2dEffectLight {
  type: Rw2dEffectType.LIGHT;
  position: RwVector3;
  color: RwColor;
  coronaFarClip: number;
  pointlightRange: number;
  coronaSize: number;
  shadowSize: number;
  coronaShowMode: number;
  coronaEnableReflection: boolean;
  coronaFlareType: number;
  shadowColorMultiplier: number;
  flags1: number;
  coronaTexName: string;
  shadowTexName: string;
  shadowZDistance: number;
  flags2: number;
}

export interface Rw2dEffectParticle {
  type: Rw2dEffectType.PARTICLE;
  position: RwVector3;
  effectName: string;
}

export interface Rw2dEffectAttractor {
  type: Rw2dEffectType.ATTRACTOR;
  position: RwVector3;
  queueDir: RwVector3;
  useDir: RwVector3;
  forwardDir: RwVector3;
  attractorType: RwPedAttractorType;
  pedExistingProbability: number;
  flags: number;
  scriptName: string;
}

export interface Rw2dEffectEnEx {
  type: Rw2dEffectType.ENEX;
  position: RwVector3;
  enterAngle: number;
  radiusX: number;
  radiusY: number;
  exitPos: RwVector3;
  exitAngle: number;
  interiorId: number;
  flags1: number;
  skyColor: number;
  interiorName: string;
  timeOn: number;
  timeOff: number;
  flags2: number;
}

export interface Rw2dEffectRoadsign {
  type: Rw2dEffectType.ROADSIGN;
  position: RwVector3;
  size: RwVector2;
  rotation: RwVector3;
  flags: number;
  text: string;
}

export interface Rw2dEffectCoverPoint {
  type: Rw2dEffectType.COVER_POINT;
  position: RwVector3;
  coverDir: RwVector2;
  usage: number;
}

export interface Rw2dEffectEscalator {
  type: Rw2dEffectType.ESCALATOR;
  position: RwVector3;
  bottom: RwVector3;
  top: RwVector3;
  end: RwVector3;
  direction: number;
}

export interface Rw2dEffectGeneric {
  type:
    | Rw2dEffectType.SUN_GLARE
    | Rw2dEffectType.INTERIOR
    | Rw2dEffectType.TRIGGER_POINT;
  position: RwVector3;
  data: Uint8Array;
}

export type Rw2dEffect =
  | Rw2dEffectLight
  | Rw2dEffectParticle
  | Rw2dEffectAttractor
  | Rw2dEffectEnEx
  | Rw2dEffectRoadsign
  | Rw2dEffectCoverPoint
  | Rw2dEffectEscalator
  | Rw2dEffectGeneric;
