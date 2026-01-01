import { RwQuaternion, RwVector3 } from "../common/types";

export enum IfpVersion {
  ANP3,
  ANPK,
  UNSUPPORTED,
}

export interface RwIfp {
  version: IfpVersion;
  name: string;
  animations: RwIfpAnimation[];
}

export interface RwIfpAnimation {
  name: string;
  bones: RwIfpBone[];
}

export interface RwIfpBone {
  name: string;
  keyframeType: string;
  useBoneId: boolean;
  boneId: number;
  keyframes: RwIfpKeyframe[];
}

export interface RwIfpKeyframe {
  time: number;
  position: RwVector3;
  rotation: RwQuaternion;
  scale: RwVector3;
}
