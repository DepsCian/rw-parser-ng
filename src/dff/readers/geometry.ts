import type { RwTextureCoordinate } from "../../common/types";
import type { RwFile, RwSectionHeader } from "../../core/rw-file";
import { RwSections } from "../../core/rw-sections";
import { unpackVersion } from "../../core/rw-version";
import type {
  Rw2dEffect,
  RwBreakable,
  RwGeometry,
  RwGeometryList,
} from "../types";
import { read2dEffects } from "./2d-effect";
import { readMaterialList } from "./material";
import { readBinMesh, readSkin } from "./mesh";

export function readGeometryList(
  file: RwFile,
  header: RwSectionHeader,
): RwGeometryList {
  file.readSectionHeader();
  const geometricObjectCount = file.readUint32();
  const geometries: RwGeometry[] = [];
  const versionNumber = unpackVersion(header.versionNumber);

  for (let i = 0; i < geometricObjectCount; i++) {
    file.readSectionHeader();
    file.readSectionHeader();
    geometries.push(readGeometry(file, versionNumber));
  }

  return { geometricObjectCount, geometries };
}

export function readGeometry(file: RwFile, versionNumber: number): RwGeometry {
  const flags = file.readUint16();
  const textureCoordinatesCount = file.readUint8();
  file.readUint8();
  const triangleCount = file.readUint32();
  const vertexCount = file.readUint32();
  file.readUint32();

  if (versionNumber < 0x34000) {
    file.skip(12);
  }

  const isTriangleStrip = (flags & (1 << 0)) !== 0;
  const isTexturedUV1 = (flags & (1 << 2)) !== 0;
  const isGeometryPrelit = (flags & (1 << 3)) !== 0;
  const isTexturedUV2 = (flags & (1 << 7)) !== 0;

  const vertexColorInformation = [];
  if (isGeometryPrelit) {
    for (let i = 0; i < vertexCount; i++) {
      vertexColorInformation.push({
        r: file.readUint8(),
        g: file.readUint8(),
        b: file.readUint8(),
        a: file.readUint8(),
      });
    }
  }

  const textureMappingInformation: RwTextureCoordinate[][] = [];
  if (isTexturedUV1 || isTexturedUV2) {
    for (let t = 0; t < textureCoordinatesCount; t++) {
      textureMappingInformation[t] = [];
      for (let v = 0; v < vertexCount; v++) {
        textureMappingInformation[t][v] = {
          u: file.readFloat(),
          v: file.readFloat(),
        };
      }
    }
  }

  const triangleInformation = [];
  for (let i = 0; i < triangleCount; i++) {
    const vertex2 = file.readUint16();
    const vertex1 = file.readUint16();
    const materialId = file.readUint16();
    const vertex3 = file.readUint16();
    triangleInformation.push({
      vector: { x: vertex1, y: vertex2, z: vertex3 },
      materialId,
    });
  }

  const boundingSphere = {
    vector: { x: file.readFloat(), y: file.readFloat(), z: file.readFloat() },
    radius: file.readFloat(),
  };

  const hasVertices = !!file.readUint32();
  const hasNormals = !!file.readUint32();

  const vertexInformation = [];
  if (hasVertices) {
    for (let i = 0; i < vertexCount; i++) {
      vertexInformation.push({
        x: file.readFloat(),
        y: file.readFloat(),
        z: file.readFloat(),
      });
    }
  }

  const normalInformation = [];
  if (hasNormals) {
    for (let i = 0; i < vertexCount; i++) {
      normalInformation.push({
        x: file.readFloat(),
        y: file.readFloat(),
        z: file.readFloat(),
      });
    }
  }

  const materialList = readMaterialList(file);
  const extensionSize = file.readSectionHeader().sectionSize;
  let binMesh;
  let skin;
  let effects2d: Rw2dEffect[] | undefined;
  let extraVertColour;
  let breakable: RwBreakable | undefined;
  let relativePosition = 0;

  while (relativePosition < extensionSize) {
    const extHeader = file.readSectionHeader();
    relativePosition += extHeader.sectionSize + 12;
    const sectionStart = file.getPosition();

    switch (extHeader.sectionType) {
      case RwSections.RwBinMesh:
        binMesh = readBinMesh(file);
        break;
      case RwSections.RwSkin:
        skin = readSkin(file, vertexCount);
        break;
      case RwSections.Rw2dEffect:
        effects2d = read2dEffects(file, extHeader.sectionSize);
        break;
      case RwSections.RwExtraVertColour:
        extraVertColour = [];
        for (let i = 0; i < vertexCount; i++) {
          extraVertColour.push({
            r: file.readUint8(),
            g: file.readUint8(),
            b: file.readUint8(),
            a: file.readUint8(),
          });
        }
        break;
      case RwSections.RwBreakable:
        breakable = readBreakable(file);
        break;
      default:
        file.skip(extHeader.sectionSize);
        break;
    }

    file.setPosition(sectionStart + extHeader.sectionSize);
  }

  return {
    textureCoordinatesCount,
    textureMappingInformation,
    boundingSphere,
    hasVertices,
    hasNormals,
    isTriangleStrip,
    vertexColorInformation,
    vertexInformation,
    normalInformation,
    triangleInformation,
    materialList,
    binMesh,
    skin,
    effects2d,
    extraVertColour,
    breakable,
  };
}

function readBreakable(file: RwFile): RwBreakable | undefined {
  const sectionHeader = file.readUint32();
  if (!sectionHeader) return undefined;

  const positionRule = file.readUint32();
  const numVertices = file.readUint16();
  file.skip(2);
  file.skip(4 * 3);
  const numTriangles = file.readUint16();
  file.skip(2);
  file.skip(4 * 2);
  const numMaterials = file.readUint16();
  file.skip(2);
  file.skip(4 * 4);

  const vertices = [];
  for (let i = 0; i < numVertices; i++) {
    vertices.push({
      x: file.readFloat(),
      y: file.readFloat(),
      z: file.readFloat(),
    });
  }

  const texCoords = [];
  for (let i = 0; i < numVertices; i++) {
    texCoords.push({ u: file.readFloat(), v: file.readFloat() });
  }

  const colors = [];
  for (let i = 0; i < numVertices; i++) {
    colors.push({
      r: file.readUint8(),
      g: file.readUint8(),
      b: file.readUint8(),
      a: file.readUint8(),
    });
  }

  const triangles = [];
  for (let i = 0; i < numTriangles; i++) {
    triangles.push({
      a: file.readUint16(),
      b: file.readUint16(),
      c: file.readUint16(),
    });
  }

  const triangleMaterialIndices = [];
  for (let i = 0; i < numTriangles; i++) {
    triangleMaterialIndices.push(file.readUint16());
  }

  const textureNames: string[] = [];
  for (let i = 0; i < numMaterials; i++) {
    textureNames.push(file.readString(32).replace(/\0+$/, ""));
  }

  const maskNames: string[] = [];
  for (let i = 0; i < numMaterials; i++) {
    maskNames.push(file.readString(32).replace(/\0+$/, ""));
  }

  const materials = [];
  for (let i = 0; i < numMaterials; i++) {
    materials.push({
      textureName: textureNames[i],
      maskName: maskNames[i],
      color: { r: file.readFloat(), g: file.readFloat(), b: file.readFloat() },
    });
  }

  return {
    positionRule,
    vertices,
    texCoords,
    colors,
    triangles,
    triangleMaterialIndices,
    materials,
  };
}
