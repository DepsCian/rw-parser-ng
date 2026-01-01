import type {
  RwColor,
  RwMatrix3,
  RwMatrix4,
  RwSphere,
  RwTextureCoordinate,
  RwTriangle,
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
