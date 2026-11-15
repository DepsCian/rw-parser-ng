import { PaletteType } from "../codecs/formats";
import { RwParseError } from "../core/errors";
import { RwFile } from "../core/rw-file";
import { decodeTextureMipmap } from "./texture-decoder";
import type {
  RwTextureDictionary,
  RwTextureNative,
  RwTextureNativeStructure,
  RwTxd,
  RwTxdStructure,
  TxdStructureOptions,
} from "./types";

export class TxdParser extends RwFile {
  parse(): RwTxd {
    return { textureDictionary: this.readTextureDictionary() };
  }

  public parseStructure(options: TxdStructureOptions = {}): RwTxdStructure {
    return {
      textureDictionary: this._readDictionary(() =>
        this._readTextureStructure(options.copyData === true),
      ),
    };
  }

  public readTextureDictionary(): RwTextureDictionary {
    return this._readDictionary(() => this.readTextureNative());
  }

  private _readDictionary<T>(readTexture: () => T): { textureCount: number; textureNatives: T[] } {
    this.readSectionHeader();
    this.readSectionHeader();

    const textureCount = this.readUint16();
    this.skip(2);

    const textureNatives: T[] = [];
    for (let i = 0; i < textureCount; i++) {
      textureNatives.push(readTexture());
    }

    this.skip(this.readSectionHeader().sectionSize);

    return { textureCount, textureNatives };
  }

  public readTextureNative(): RwTextureNative {
    const source = this._readTextureStructure(false);
    const { palette, compressionFlags, mipmaps, ...metadata } = source;
    return {
      ...metadata,
      mipmaps: mipmaps.length ? [Array.from(decodeTextureMipmap(source))] : [],
    };
  }

  private _readTextureStructure(copyData: boolean): RwTextureNativeStructure {
    const native = this.readSectionHeader();
    const nativeEnd = this.getPosition() + native.sectionSize;
    const structure = this.readSectionHeader();
    const structureEnd = this.getPosition() + structure.sectionSize;
    if (
      nativeEnd > this.getSize() ||
      structureEnd > nativeEnd ||
      structureEnd - this.getPosition() < 88
    ) {
      throw new RwParseError("Invalid native texture section bounds");
    }

    const platformId = this.readUint32();
    const flags = this.readUint32();
    const filterMode = flags & 0xff;
    const uAddressing = (flags & 0xf00) >> 8;
    const vAddressing = (flags & 0xf000) >> 12;

    const textureName = this.readString(32);
    const maskName = this.readString(32);

    const rasterFormat = this.readUint32();
    const d3dFormat = this.readString(4);
    const width = this.readUint16();
    const height = this.readUint16();
    const depth = this.readUint8();
    const mipmapCount = this.readUint8();
    const rasterType = this.readUint8();
    const compressionFlags = this.readUint8();

    const alpha = (compressionFlags & (1 << 0)) !== 0;
    const cubeTexture = (compressionFlags & (1 << 1)) !== 0;
    const autoMipMaps = (compressionFlags & (1 << 2)) !== 0;
    const compressed = (compressionFlags & (1 << 3)) !== 0;

    const paletteType = (rasterFormat >> 13) & 0b11;
    const palette =
      paletteType !== PaletteType.PALETTE_NONE
        ? this._readPayload(
            paletteType === PaletteType.PALETTE_8 ? 1024 : depth === 4 ? 64 : 128,
            structureEnd,
            copyData,
          )
        : new Uint8Array(0);

    const mipmaps: RwTextureNativeStructure["mipmaps"] = [];

    for (let level = 0; level < mipmapCount; level++) {
      if (structureEnd - this.getPosition() < 4) throw new RwParseError("Missing mipmap size");
      const rasterSize = this.readUint32();
      mipmaps.push({
        width: Math.max(1, Math.floor(width / 2 ** level)),
        height: Math.max(1, Math.floor(height / 2 ** level)),
        data: this._readPayload(rasterSize, structureEnd, copyData),
      });
    }

    this.setPosition(structureEnd);
    if (nativeEnd - this.getPosition() < 12) throw new RwParseError("Missing texture extension");
    const extension = this.readSectionHeader();
    if (extension.sectionSize > nativeEnd - this.getPosition())
      throw new RwParseError("Invalid texture extension bounds");
    this.setPosition(nativeEnd);

    return {
      platformId,
      filterMode,
      uAddressing,
      vAddressing,
      textureName,
      maskName,
      rasterFormat,
      d3dFormat,
      width,
      height,
      depth,
      mipmapCount,
      rasterType,
      alpha,
      cubeTexture,
      autoMipMaps,
      compressed,
      compressionFlags,
      palette,
      mipmaps,
    };
  }

  private _readPayload(size: number, end: number, copyData: boolean): Uint8Array {
    if (size > end - this.getPosition())
      throw new RwParseError("Texture payload exceeds its section");
    return copyData ? this.readBytes(size) : this.readView(size);
  }
}
