import { RwFile } from "../../core/rw-file";
import {
  IfpVersion,
  RwIfp,
  RwIfpAnimation,
  RwIfpBone,
  RwIfpKeyframe,
} from "../types";

const QUAT_SCALE = 4096.0;
const POS_SCALE = 1024.0;

export function readAnp3(file: RwFile): RwIfp {
  file.skip(4); // ANP3 signature
  file.readUint32(); // size
  const name = file.readString(24);
  const animationsCount = file.readUint32();

  const animations: RwIfpAnimation[] = [];
  for (let i = 0; i < animationsCount; i++) {
    animations.push(readAnimation(file));
  }

  return { version: IfpVersion.ANP3, name, animations };
}

function readAnimation(file: RwFile): RwIfpAnimation {
  const name = file.readString(24);
  const bonesCount = file.readUint32();
  file.skip(8); // keyframes_size + unk

  const bones: RwIfpBone[] = [];
  for (let i = 0; i < bonesCount; i++) {
    bones.push(readBone(file));
  }

  return { name, bones };
}

function readBone(file: RwFile): RwIfpBone {
  const name = file.readString(24);
  const keyframeTypeNum = file.readUint32();
  const keyframesCount = file.readUint32();
  const keyframeType = keyframeTypeNum === 4 ? "KRT0" : "KR00";
  const boneId = file.readInt32();

  const keyframes: RwIfpKeyframe[] = [];
  const hasTranslation = keyframeType[2] === "T";

  for (let i = 0; i < keyframesCount; i++) {
    const qx = file.readInt16() / QUAT_SCALE;
    const qy = file.readInt16() / QUAT_SCALE;
    const qz = file.readInt16() / QUAT_SCALE;
    const qw = file.readInt16() / QUAT_SCALE;
    const time = file.readInt16();

    let px = 0,
      py = 0,
      pz = 0;
    if (hasTranslation) {
      px = file.readInt16() / POS_SCALE;
      py = file.readInt16() / POS_SCALE;
      pz = file.readInt16() / POS_SCALE;
    }

    keyframes.push({
      time,
      position: { x: px, y: py, z: pz },
      rotation: { w: qw, x: qx, y: qy, z: qz },
      scale: { x: 1, y: 1, z: 1 },
    });
  }

  return { name, keyframeType, useBoneId: true, boneId, keyframes };
}
