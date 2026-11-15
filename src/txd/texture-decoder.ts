import { D3DFormat, PaletteType, PlatformType, RasterFormat } from "../codecs/formats";
import { RwParseError } from "../core/errors";
import { decodeDxtBitmap, decodePaletteBitmap, decodeRasterBitmap } from "./bitmap-decoder";
import type { RwTextureNativeStructure } from "./types";

export function decodeTextureMipmap(texture: RwTextureNativeStructure, level = 0): Uint8Array {
  if (!Number.isSafeInteger(level) || level < 0 || level >= texture.mipmaps.length) {
    throw new RangeError(`Invalid mipmap level: ${level}`);
  }
  const { data, width, height } = texture.mipmaps[level];
  if (
    !Number.isSafeInteger(width) ||
    !Number.isSafeInteger(height) ||
    width <= 0 ||
    height <= 0 ||
    !Number.isSafeInteger(width * height * 4) ||
    width * height * 4 > 0xffffffff
  ) {
    throw new RwParseError("Invalid mipmap dimensions");
  }
  const paletteType = (texture.rasterFormat >> 13) & 3;
  const pixelFormat = texture.rasterFormat & 0x0f00;
  if (texture.palette.length) {
    const packed = paletteType !== PaletteType.PALETTE_8 && texture.depth === 4;
    requireBytes(data, Math.ceil((width * height) / (packed ? 2 : 1)));
    let largestIndex = 0;
    const size = Math.ceil((width * height) / (packed ? 2 : 1));
    for (let index = 0; index < size; index++) {
      largestIndex = Math.max(largestIndex, packed ? data[index] >> 4 : data[index]);
      if (packed && index * 2 + 1 < width * height)
        largestIndex = Math.max(largestIndex, data[index] & 15);
    }
    requireBytes(texture.palette, (largestIndex + 1) * 4);
    const noAlpha = [
      RasterFormat.RASTER_565,
      RasterFormat.RASTER_LUM,
      RasterFormat.RASTER_888,
      RasterFormat.RASTER_555,
    ];
    const hasAlpha =
      (texture.platformId === PlatformType.D3D9 && texture.alpha) ||
      (texture.platformId === PlatformType.D3D8 && !noAlpha.includes(pixelFormat));
    return decodePaletteBitmap(
      paletteType,
      texture.depth,
      hasAlpha,
      data,
      texture.palette,
      width,
      height,
    );
  }
  if (paletteType !== PaletteType.PALETTE_NONE) throw new RwParseError("Missing texture palette");
  const compression =
    texture.platformId === PlatformType.D3D8 && texture.compressionFlags !== 0
      ? `DXT${texture.compressionFlags}`
      : texture.platformId === PlatformType.D3D9 && texture.compressed
        ? texture.d3dFormat
        : undefined;
  if (compression !== undefined) {
    switch (compression) {
      case D3DFormat.D3D_DXT1:
        requireBytes(data, Math.ceil(width / 4) * Math.ceil(height / 4) * 8);
        break;
      case D3DFormat.D3D_DXT2:
      case D3DFormat.D3D_DXT3:
      case D3DFormat.D3D_DXT4:
      case D3DFormat.D3D_DXT5:
        requireBytes(data, Math.ceil(width / 4) * Math.ceil(height / 4) * 16);
        break;
      case D3DFormat.D3DFMT_A8L8:
        requireBytes(data, width * height * 2);
        break;
    }
    return decodeDxtBitmap(compression, data, width, height);
  }
  requireBytes(data, width * height * rasterBytes(pixelFormat));
  return decodeRasterBitmap(pixelFormat, data, width, height);
}

function requireBytes(data: Uint8Array, size: number): void {
  if (data.length < size)
    throw new RwParseError(`Truncated texture data: need ${size} bytes, got ${data.length}`);
}

function rasterBytes(format: number): number {
  switch (format) {
    case RasterFormat.RASTER_LUM:
      return 1;
    case RasterFormat.RASTER_1555:
    case RasterFormat.RASTER_565:
    case RasterFormat.RASTER_4444:
    case RasterFormat.RASTER_555:
      return 2;
    case RasterFormat.RASTER_888:
    case RasterFormat.RASTER_8888:
      return 4;
    default:
      throw new RwParseError(`Unsupported texture raster format: 0x${format.toString(16)}`);
  }
}
