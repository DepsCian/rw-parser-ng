import { bc1, bc2, bc3 } from "../utils/bc-decoder";
import {
  bgra1555,
  bgra4444,
  bgra555,
  bgra565,
  bgra888,
  bgra8888,
} from "../utils/bgra-decoder";
import {
  lum8,
  lum8a8,
  pal4,
  pal4NoAlpha,
  pal8,
  pal8NoAlpha,
} from "../utils/palette-decoder";
import {
  D3DFormat,
  PaletteType,
  RasterFormat,
} from "../utils/image-format-enums";

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
      ? pal4(raster, palette, width, height)
      : pal4NoAlpha(raster, palette, width, height);
  }
  return hasAlpha
    ? pal8(raster, palette, width, height)
    : pal8NoAlpha(raster, palette, width, height);
}

export function decodeDxtBitmap(
  dxtType: string,
  raster: Uint8Array,
  width: number,
  height: number,
): Uint8Array {
  switch (dxtType) {
    case D3DFormat.D3D_DXT1:
      return bc1(raster, width, height);
    case D3DFormat.D3D_DXT2:
      return bc2(raster, width, height, true);
    case D3DFormat.D3D_DXT3:
      return bc2(raster, width, height, false);
    case D3DFormat.D3D_DXT4:
      return bc3(raster, width, height, true);
    case D3DFormat.D3D_DXT5:
      return bc3(raster, width, height, false);
    case D3DFormat.D3DFMT_A8L8:
      return lum8a8(raster, width, height);
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
      return bgra1555(raster, width, height);
    case RasterFormat.RASTER_565:
      return bgra565(raster, width, height);
    case RasterFormat.RASTER_4444:
      return bgra4444(raster, width, height);
    case RasterFormat.RASTER_LUM:
      return lum8(raster, width, height);
    case RasterFormat.RASTER_8888:
      return bgra8888(raster, width, height);
    case RasterFormat.RASTER_888:
      return bgra888(raster, width, height);
    case RasterFormat.RASTER_555:
      return bgra555(raster, width, height);
    default:
      return new Uint8Array(0);
  }
}
