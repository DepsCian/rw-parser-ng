import { RwFile } from "../core/rw-file";
import { PaletteType, PlatformType, RasterFormat } from "../codecs/formats";
import {
  decodeDxtBitmap,
  decodePaletteBitmap,
  decodeRasterBitmap,
} from "./bitmap-decoder";
import { RwTextureNative, RwTextureDictionary, RwTxd } from "./types";

export class TxdParser extends RwFile {
  constructor(stream: Buffer) {
    super(stream);
  }

  parse(): RwTxd {
    return { textureDictionary: this.readTextureDictionary() };
  }

  public readTextureDictionary(): RwTextureDictionary {
    this.readSectionHeader();
    this.readSectionHeader();

    const textureCount = this.readUint16();
    this.skip(2);

    const textureNatives: RwTextureNative[] = [];
    for (let i = 0; i < textureCount; i++) {
      textureNatives.push(this.readTextureNative());
    }

    this.skip(this.readSectionHeader().sectionSize);

    return { textureCount, textureNatives };
  }

  public readTextureNative(): RwTextureNative {
    this.readSectionHeader();
    this.readSectionHeader();

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
    const pixelFormat = rasterFormat & 0x0f00;
    const palette =
      paletteType !== PaletteType.PALETTE_NONE
        ? this.read(
            paletteType === PaletteType.PALETTE_8
              ? 1024
              : depth === 4
                ? 64
                : 128,
          )
        : new Uint8Array(0);

    const mipmaps: number[][] = [];

    for (let i = 0; i < mipmapCount; i++) {
      const rasterSize = this.readUint32();
      const raster = this.read(rasterSize);

      if (i === 0) {
        const bitmap = this.decodeBitmap(
          platformId,
          compressionFlags,
          compressed,
          alpha,
          paletteType,
          depth,
          pixelFormat,
          d3dFormat,
          raster,
          palette,
          width,
          height,
        );
        mipmaps.push(Array.from(bitmap));
      }
    }

    this.skip(this.readSectionHeader().sectionSize);

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
      mipmaps,
    };
  }

  private decodeBitmap(
    platformId: number,
    compressionFlags: number,
    compressed: boolean,
    alpha: boolean,
    paletteType: number,
    depth: number,
    pixelFormat: number,
    d3dFormat: string,
    raster: Uint8Array,
    palette: Uint8Array,
    width: number,
    height: number,
  ): Uint8Array {
    if (palette.length !== 0) {
      const noAlphaFormats = [
        RasterFormat.RASTER_565,
        RasterFormat.RASTER_LUM,
        RasterFormat.RASTER_888,
        RasterFormat.RASTER_555,
      ];
      const hasAlpha =
        (platformId === PlatformType.D3D9 && alpha) ||
        (platformId === PlatformType.D3D8 &&
          !noAlphaFormats.includes(pixelFormat));
      return decodePaletteBitmap(
        paletteType,
        depth,
        hasAlpha,
        raster,
        palette,
        width,
        height,
      );
    }

    if (platformId === PlatformType.D3D8 && compressionFlags !== 0) {
      return decodeDxtBitmap("DXT" + compressionFlags, raster, width, height);
    }

    if (platformId === PlatformType.D3D9 && compressed) {
      return decodeDxtBitmap(d3dFormat, raster, width, height);
    }

    return decodeRasterBitmap(pixelFormat, raster, width, height);
  }
}
