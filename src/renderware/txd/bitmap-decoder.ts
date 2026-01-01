import { ImageDecoder } from "../utils/ImageDecoder";
import {
  D3DFormat,
  PaletteType,
  RasterFormat,
} from "../utils/ImageFormatEnums";

export function decodePaletteBitmap(
  paletteType: number,
  depth: number,
  hasAlpha: boolean,
  raster: Uint8Array,
  palette: Uint8Array,
  width: number,
  height: number,
): Uint8Array {
  if (paletteType !== PaletteType.PALETTE_8 && depth === 4) {
    return hasAlpha
      ? ImageDecoder.pal4(raster, palette, width, height)
      : ImageDecoder.pal4NoAlpha(raster, palette, width, height);
  }

  return hasAlpha
    ? ImageDecoder.pal8(raster, palette, width, height)
    : ImageDecoder.pal8NoAlpha(raster, palette, width, height);
}

export function decodeDxtBitmap(
  dxtType: string,
  raster: Uint8Array,
  width: number,
  height: number,
): Uint8Array {
  switch (dxtType) {
    case D3DFormat.D3D_DXT1:
      return ImageDecoder.bc1(raster, width, height);
    case D3DFormat.D3D_DXT2:
      return ImageDecoder.bc2(raster, width, height, true);
    case D3DFormat.D3D_DXT3:
      return ImageDecoder.bc2(raster, width, height, false);
    case D3DFormat.D3D_DXT4:
      return ImageDecoder.bc3(raster, width, height, true);
    case D3DFormat.D3D_DXT5:
      return ImageDecoder.bc3(raster, width, height, false);
    case D3DFormat.D3DFMT_A8L8:
      return ImageDecoder.lum8a8(raster, width, height);
    default:
      return new Uint8Array(0);
  }
}

export function decodeRasterBitmap(
  rasterFormat: number,
  raster: Uint8Array,
  width: number,
  height: number,
): Uint8Array {
  switch (rasterFormat) {
    case RasterFormat.RASTER_1555:
      return ImageDecoder.bgra1555(raster, width, height);
    case RasterFormat.RASTER_565:
      return ImageDecoder.bgra565(raster, width, height);
    case RasterFormat.RASTER_4444:
      return ImageDecoder.bgra4444(raster, width, height);
    case RasterFormat.RASTER_LUM:
      return ImageDecoder.lum8(raster, width, height);
    case RasterFormat.RASTER_8888:
      return ImageDecoder.bgra8888(raster, width, height);
    case RasterFormat.RASTER_888:
      return ImageDecoder.bgra888(raster, width, height);
    case RasterFormat.RASTER_555:
      return ImageDecoder.bgra555(raster, width, height);
    default:
      return new Uint8Array(0);
  }
}
