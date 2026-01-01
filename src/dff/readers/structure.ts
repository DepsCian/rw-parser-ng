import type { RwFile } from "../../core/rw-file";
import type { RwAnimNode, RwAtomic, RwBone, RwClump, RwFrame, RwFrameList } from "../types";

export function readClump(file: RwFile): RwClump {
  const { versionNumber } = file.readSectionHeader();
  const atomicCount = file.readUint32();

  let lightCount: number | undefined;
  let cameraCount: number | undefined;

  if (versionNumber > 0x33000) {
    lightCount = file.readUint32();
    cameraCount = file.readUint32();
  }

  return { atomicCount, lightCount, cameraCount };
}

export function readFrameList(file: RwFile): RwFrameList {
  file.readSectionHeader();
  const frameCount = file.readUint32();
  const frames: RwFrame[] = [];

  for (let i = 0; i < frameCount; i++) {
    const rotationMatrix = {
      right: {
        x: file.readFloat(),
        y: file.readFloat(),
        z: file.readFloat(),
      },
      up: { x: file.readFloat(), y: file.readFloat(), z: file.readFloat() },
      at: { x: file.readFloat(), y: file.readFloat(), z: file.readFloat() },
    };

    const coordinatesOffset = {
      x: file.readFloat(),
      y: file.readFloat(),
      z: file.readFloat(),
    };

    const parentFrame = file.readInt32();
    file.skip(4);

    frames.push({ rotationMatrix, coordinatesOffset, parentFrame });
  }

  return { frameCount, frames };
}

export function readAnimNode(file: RwFile): RwAnimNode {
  file.skip(4);
  const boneId = file.readInt32();
  const boneCount = file.readInt32();
  const bones: RwBone[] = [];

  if (boneCount > 0) {
    file.skip(8);
  }

  for (let i = 0; i < boneCount; i++) {
    bones.push({
      boneId: file.readInt32(),
      boneIndex: file.readInt32(),
      flags: file.readInt32(),
    });
  }

  return { boneId, bonesCount: boneCount, bones };
}

export function readAtomic(file: RwFile): RwAtomic {
  file.readSectionHeader();
  const frameIndex = file.readUint32();
  const geometryIndex = file.readUint32();
  const flags = file.readUint32();
  file.skip(4);

  return { frameIndex, geometryIndex, flags };
}
