import { RwFile } from "../../rw-file";
import { RwBinMesh, RwMesh, RwSkin } from "../types";

export function readMesh(file: RwFile): RwMesh {
  const indexCount = file.readUint32();
  const materialIndex = file.readUint32();
  const indices: number[] = [];

  for (let i = 0; i < indexCount; i++) {
    indices.push(file.readUint32());
  }

  return { indexCount, materialIndex, indices };
}

export function readBinMesh(file: RwFile): RwBinMesh {
  file.skip(4);
  const meshCount = file.readUint32();
  file.skip(4);

  const meshes: RwMesh[] = [];
  for (let i = 0; i < meshCount; i++) {
    meshes.push(readMesh(file));
  }

  return { meshCount, meshes };
}

export function readSkin(file: RwFile, vertexCount: number): RwSkin {
  const boneCount = file.readUint8();
  const usedBoneCount = file.readUint8();
  const maxWeightsPerVertex = file.readUint8();

  file.skip(1);
  file.skip(usedBoneCount);

  const boneVertexIndices: number[][] = [];
  for (let i = 0; i < vertexCount; i++) {
    const indices: number[] = [];
    for (let j = 0; j < 4; j++) {
      indices.push(file.readUint8());
    }
    boneVertexIndices.push(indices);
  }

  const vertexWeights: number[][] = [];
  for (let i = 0; i < vertexCount; i++) {
    const weights: number[] = [];
    for (let j = 0; j < 4; j++) {
      weights.push(file.readFloat());
    }
    vertexWeights.push(weights);
  }

  const inverseBoneMatrices = [];
  for (let i = 0; i < boneCount; i++) {
    inverseBoneMatrices.push({
      right: {
        x: file.readFloat(),
        y: file.readFloat(),
        z: file.readFloat(),
        t: file.readFloat(),
      },
      up: {
        x: file.readFloat(),
        y: file.readFloat(),
        z: file.readFloat(),
        t: file.readFloat(),
      },
      at: {
        x: file.readFloat(),
        y: file.readFloat(),
        z: file.readFloat(),
        t: file.readFloat(),
      },
      transform: {
        x: file.readFloat(),
        y: file.readFloat(),
        z: file.readFloat(),
        t: file.readFloat(),
      },
    });
  }

  return {
    boneCount,
    usedBoneCount,
    maxWeightsPerVertex,
    boneVertexIndices,
    vertexWeights,
    inverseBoneMatrices,
  };
}
