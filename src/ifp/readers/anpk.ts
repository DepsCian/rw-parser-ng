import { RwFile } from "../../core/rw-file";
import {
  IfpVersion,
  RwIfp,
  RwIfpAnimation,
  RwIfpBone,
  RwIfpKeyframe,
} from "../types";

export function readAnpk(file: RwFile): RwIfp {
  file.skip(4); // ANPK signature
  file.readUint32(); // size
  file.skip(4); // INFO
  const infoLen = file.readUint32();
  const animationsCount = file.readUint32();
  const name = file.readString(infoLen - 4);
  file.skip((4 - (infoLen % 4)) % 4); // align

  const animations: RwIfpAnimation[] = [];
  for (let i = 0; i < animationsCount; i++) {
    animations.push(readAnimation(file));
  }

  return { version: IfpVersion.ANPK, name, animations };
}

function readAnimation(file: RwFile): RwIfpAnimation {
  file.skip(4); // NAME
  const nameLen = file.readUint32();
  const name = file.readString(nameLen);
  file.skip((4 - (nameLen % 4)) % 4); // align
  file.skip(4); // DGAN
  file.skip(4); // animation_size
  file.skip(4); // INFO
  file.skip(4); // unk_size
  const bonesCount = file.readUint32();
  file.skip(4); // unk

  const bones: RwIfpBone[] = [];
  for (let i = 0; i < bonesCount; i++) {
    bones.push(readBone(file));
  }

  return { name, bones };
}

function readBone(file: RwFile): RwIfpBone {
  file.skip(4); // CPAN
  file.skip(4); // bone_len
  file.skip(4); // ANIM
  const animLen = file.readUint32();
  const name = file.readString(28);
  const keyframesCount = file.readUint32();
  file.skip(8); // unk

  const useBoneId = animLen === 44;
  let boneId = 0;
  if (useBoneId) {
    boneId = file.readInt32();
  } else {
    file.skip(8); // sibling_x, sibling_y
  }

  let keyframeType = "K000";
  const keyframes: RwIfpKeyframe[] = [];

  if (keyframesCount > 0) {
    keyframeType = file.readString(4);
    file.skip(4); // keyframes_len

    const hasTranslation = keyframeType[2] === "T";
    const hasScale = keyframeType[3] === "S";

    for (let i = 0; i < keyframesCount; i++) {
      const qx = file.readFloat();
      const qy = file.readFloat();
      const qz = file.readFloat();
      const qw = file.readFloat();

      let px = 0,
        py = 0,
        pz = 0;
      if (hasTranslation) {
        px = file.readFloat();
        py = file.readFloat();
        pz = file.readFloat();
      }

      let sx = 1,
        sy = 1,
        sz = 1;
      if (hasScale) {
        sx = file.readFloat();
        sy = file.readFloat();
        sz = file.readFloat();
      }

      const time = file.readFloat();

      keyframes.push({
        time,
        position: { x: px, y: py, z: pz },
        rotation: { w: qw, x: qx, y: qy, z: qz },
        scale: { x: sx, y: sy, z: sz },
      });
    }
  }

  return { name, keyframeType, useBoneId, boneId, keyframes };
}
