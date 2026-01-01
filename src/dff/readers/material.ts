import { RwFile } from "../../core/rw-file";
import { RwMaterial, RwMaterialList, RwTexture } from "../types";

export function readTexture(file: RwFile): RwTexture {
  file.readSectionHeader();
  file.readSectionHeader();

  const textureData = file.readUint32();
  const textureFiltering = textureData & 0xff;
  const uAddressing = (textureData & 0xf00) >> 8;
  const vAddressing = (textureData & 0xf000) >> 12;
  const usesMipLevels = (textureData & (1 << 16)) !== 0;

  const textureNameSize = file.readSectionHeader().sectionSize;
  const textureName = file.readString(textureNameSize);

  file.skip(file.readSectionHeader().sectionSize);
  file.skip(file.readSectionHeader().sectionSize);

  return {
    textureFiltering,
    uAddressing,
    vAddressing,
    usesMipLevels,
    textureName,
  };
}

export function readMaterial(file: RwFile): RwMaterial {
  file.readSectionHeader();
  const header = file.readSectionHeader();

  file.skip(4);

  const color = {
    r: file.readUint8(),
    g: file.readUint8(),
    b: file.readUint8(),
    a: file.readUint8(),
  };

  file.skip(4);

  const isTextured = file.readUint32() > 0;

  let ambient: number | undefined;
  let specular: number | undefined;
  let diffuse: number | undefined;

  if (header.versionNumber > 0x30400) {
    ambient = file.readFloat();
    specular = file.readFloat();
    diffuse = file.readFloat();
  }

  let texture: RwTexture | undefined;
  if (isTextured) {
    texture = readTexture(file);
  }

  file.skip(file.readSectionHeader().sectionSize);

  return { color, isTextured, ambient, specular, diffuse, texture };
}

export function readMaterialList(file: RwFile): RwMaterialList {
  file.readSectionHeader();
  file.readSectionHeader();

  const materialInstanceCount = file.readUint32();
  const materialIndices: number[] = [];

  for (let i = 0; i < materialInstanceCount; i++) {
    materialIndices.push(file.readInt32());
  }

  const materialData: RwMaterial[] = [];

  for (let i = 0; i < materialInstanceCount; i++) {
    const materialIndex = materialIndices[i];
    if (materialIndex === -1) {
      materialData.push(readMaterial(file));
    } else {
      materialData.push(materialData[materialIndex]);
    }
  }

  return { materialInstanceCount, materialData };
}
