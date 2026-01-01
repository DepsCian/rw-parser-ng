import { RwParseStructureNotFoundError } from "../core/errors";
import { RwFile } from "../core/rw-file";
import { RwSections } from "../core/rw-sections";
import { getVersionString, unpackVersion } from "../core/rw-version";
import { DffModelType } from "./dff-model-type";
import { readAnimNode, readAtomic, readFrameList, readGeometryList } from "./readers";
import type { RwAnimNode, RwDff, RwFrameList, RwGeometryList } from "./types";

export class DffParser extends RwFile {
  parse(): RwDff {
    let version: string | undefined;
    let versionNumber: number | undefined;
    const atomics: number[] = [];
    const dummies: string[] = [];
    const animNodes: RwAnimNode[] = [];
    let geometryList: RwGeometryList | null = null;
    let frameList: RwFrameList | null = null;

    while (this.getPosition() < this.getSize()) {
      let header;
      try {
        header = this.readSectionHeader();
      } catch (error) {
        console.warn(
          `Failed to read section header at offset ${this.getPosition().toString(16)}: ${error instanceof Error ? error.message : error}. Truncating file.`,
        );
        break;
      }

      if (header.sectionType === 0) break;
      if (header.sectionSize === 0) continue;

      if (this.getPosition() + header.sectionSize > this.getSize()) {
        console.warn(
          `Section at offset ${this.getPosition().toString(16)} claims size ${header.sectionSize} but only ${this.getSize() - this.getPosition()} bytes remaining. Truncating file.`,
        );
        break;
      }

      switch (header.sectionType) {
        case RwSections.RwClump:
          versionNumber = unpackVersion(header.versionNumber);
          version = getVersionString(versionNumber);
          break;
        case RwSections.RwFrameList:
          frameList = readFrameList(this);
          break;
        case RwSections.RwExtension: {
          const extHeader = this.readSectionHeader();
          switch (extHeader.sectionType) {
            case RwSections.RwNodeName:
              dummies.push(this.readString(extHeader.sectionSize));
              break;
            case RwSections.RwAnim:
              animNodes.push(readAnimNode(this));
              break;
            default:
              this.skip(extHeader.sectionSize);
              break;
          }
          break;
        }
        case RwSections.RwGeometryList:
          geometryList = readGeometryList(this, header);
          break;
        case RwSections.RwAtomic: {
          const atomic = readAtomic(this);
          atomics[atomic.geometryIndex] = atomic.frameIndex;
          break;
        }
        case RwSections.RwNodeName:
          dummies.push(this.readString(header.sectionSize));
          break;
        case RwSections.RwAnim:
          animNodes.push(readAnimNode(this));
          break;
        default:
          this.skip(header.sectionSize);
          break;
      }
    }

    if (!version || !versionNumber) {
      throw new RwParseStructureNotFoundError("version");
    }

    if (!geometryList?.geometries?.length) {
      throw new RwParseStructureNotFoundError("geometry list");
    }

    let modelType = DffModelType.GENERIC;
    if (geometryList.geometries.some((g) => g.skin)) {
      modelType = DffModelType.SKIN;
    } else if (
      dummies.some((d) => d.toLowerCase().includes("wheel") || d.toLowerCase().includes("chassis"))
    ) {
      modelType = DffModelType.VEHICLE;
    }

    return {
      modelType,
      version,
      versionNumber,
      geometryList,
      frameList,
      atomics,
      dummies,
      animNodes,
    };
  }
}
