export interface RwVector2 {
  x: number;
  y: number;
}

export interface RwVector3 {
  x: number;
  y: number;
  z: number;
}

export interface RwVector4 {
  x: number;
  y: number;
  z: number;
  t: number;
}

export interface RwQuaternion {
  x: number;
  y: number;
  z: number;
  w: number;
}

export interface RwMatrix3 {
  right: RwVector3;
  up: RwVector3;
  at: RwVector3;
}

export interface RwMatrix4 {
  right: RwVector4;
  up: RwVector4;
  at: RwVector4;
  transform: RwVector4;
}

export interface RwColor {
  r: number;
  g: number;
  b: number;
  a: number;
}

export interface RwTextureCoordinate {
  u: number;
  v: number;
}

export interface RwTriangle {
  vector: RwVector3;
  materialId: number;
}

export interface RwSphere {
  vector: RwVector3;
  radius: number;
}
