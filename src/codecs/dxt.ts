import { decode565, readUInt16LE, readUInt32LE } from "./color";

export function bc1(
  data: Uint8Array,
  width: number,
  height: number,
): Uint8Array {
  const rgba = new Uint8Array(4 * width * height);
  const colorPalette = new Uint8Array(16);
  let offset = 0;

  for (let y = 0; y < height; y += 4) {
    for (let x = 0; x < width; x += 4) {
      const color0 = readUInt16LE(data, offset);
      const color1 = readUInt16LE(data, offset + 2);
      let colorBits = readUInt32LE(data, offset + 4);
      offset += 8;

      const [c0r, c0g, c0b] = decode565(color0);
      const [c1r, c1g, c1b] = decode565(color1);

      colorPalette[0] = c0r;
      colorPalette[1] = c0g;
      colorPalette[2] = c0b;
      colorPalette[4] = c1r;
      colorPalette[5] = c1g;
      colorPalette[6] = c1b;

      if (color0 > color1) {
        colorPalette[8] = (2 * c0r + c1r) / 3;
        colorPalette[9] = (2 * c0g + c1g) / 3;
        colorPalette[10] = (2 * c0b + c1b) / 3;
        colorPalette[12] = (c0r + 2 * c1r) / 3;
        colorPalette[13] = (c0g + 2 * c1g) / 3;
        colorPalette[14] = (c0b + 2 * c1b) / 3;
      } else {
        colorPalette[8] = (c0r + c1r) >> 1;
        colorPalette[9] = (c0g + c1g) >> 1;
        colorPalette[10] = (c0b + c1b) >> 1;
        colorPalette[12] = 0;
        colorPalette[13] = 0;
        colorPalette[14] = 0;
      }

      const baseIndex = (y * width + x) * 4;
      for (let k = 0; k < 16; k++) {
        const colorIdx = colorBits & 0x3;
        colorBits >>>= 2;
        const j = k >> 2,
          i = k & 3;
        const idx = baseIndex + ((j * width + i) << 2);

        rgba[idx] = colorPalette[colorIdx * 4];
        rgba[idx + 1] = colorPalette[colorIdx * 4 + 1];
        rgba[idx + 2] = colorPalette[colorIdx * 4 + 2];
        rgba[idx + 3] = color0 <= color1 && colorIdx === 3 ? 0 : 255;
      }
    }
  }
  return rgba;
}

export function bc2(
  data: Uint8Array,
  width: number,
  height: number,
  premultiplied: boolean,
): Uint8Array {
  const rgba = new Uint8Array(4 * width * height);
  const colorPalette = new Uint8Array(16);
  const alphaTable = new Uint8Array(16);
  for (let i = 0; i < 16; i++) alphaTable[i] = ((i * 255 + 7.5) / 15) | 0;

  let offset = 0;
  for (let y = 0; y < height; y += 4) {
    for (let x = 0; x < width; x += 4) {
      const alpha0 = readUInt32LE(data, offset);
      const alpha1 = readUInt32LE(data, offset + 4);
      offset += 8;

      const color0 = readUInt16LE(data, offset);
      const color1 = readUInt16LE(data, offset + 2);
      let colorBits = readUInt32LE(data, offset + 4);
      offset += 8;

      const [c0r, c0g, c0b] = decode565(color0);
      const [c1r, c1g, c1b] = decode565(color1);

      colorPalette[0] = c0r;
      colorPalette[1] = c0g;
      colorPalette[2] = c0b;
      colorPalette[4] = c1r;
      colorPalette[5] = c1g;
      colorPalette[6] = c1b;

      if (color0 > color1) {
        colorPalette[8] = (2 * c0r + c1r) / 3;
        colorPalette[9] = (2 * c0g + c1g) / 3;
        colorPalette[10] = (2 * c0b + c1b) / 3;
        colorPalette[12] = (c0r + 2 * c1r) / 3;
        colorPalette[13] = (c0g + 2 * c1g) / 3;
        colorPalette[14] = (c0b + 2 * c1b) / 3;
      } else {
        colorPalette[8] = (c0r + c1r) >> 1;
        colorPalette[9] = (c0g + c1g) >> 1;
        colorPalette[10] = (c0b + c1b) >> 1;
        colorPalette[12] = 0;
        colorPalette[13] = 0;
        colorPalette[14] = 0;
      }

      const baseIndex = (y * width + x) << 2;
      for (let k = 0; k < 16; k++) {
        const j = k >> 2,
          i = k & 3;
        const idx = baseIndex + ((j * width + i) << 2);
        const colorIdx = colorBits & 0x3;
        colorBits >>>= 2;

        const bitPos = (j << 2) + i;
        const byteIndex = bitPos >> 3;
        const shift = (bitPos & 7) << 2;
        const alpha4 = ((byteIndex === 0 ? alpha0 : alpha1) >>> shift) & 0xf;
        const alpha = alphaTable[alpha4];

        rgba[idx] = colorPalette[colorIdx * 4];
        rgba[idx + 1] = colorPalette[colorIdx * 4 + 1];
        rgba[idx + 2] = colorPalette[colorIdx * 4 + 2];
        rgba[idx + 3] = alpha;

        if (premultiplied && alpha > 0 && alpha < 255) {
          const factor = 255 / alpha;
          rgba[idx] = Math.min(255, Math.round(rgba[idx] * factor));
          rgba[idx + 1] = Math.min(255, Math.round(rgba[idx + 1] * factor));
          rgba[idx + 2] = Math.min(255, Math.round(rgba[idx + 2] * factor));
        }
      }
    }
  }
  return rgba;
}

export function bc3(
  data: Uint8Array,
  width: number,
  height: number,
  premultiplied: boolean,
): Uint8Array {
  const rgba = new Uint8Array(4 * width * height);
  const alphaPalette = new Uint8Array(8);
  const colorPalette = new Uint8Array(16);
  const alphaIndices = new Uint8Array(16);
  let offset = 0;

  for (let y = 0; y < height; y += 4) {
    for (let x = 0; x < width; x += 4) {
      const alpha0 = data[offset++];
      const alpha1 = data[offset++];
      const alphaBits = data.subarray(offset, offset + 6);
      offset += 6;

      const color0 = readUInt16LE(data, offset);
      const color1 = readUInt16LE(data, offset + 2);
      let colorBits = readUInt32LE(data, offset + 4);
      offset += 8;

      const [c0r, c0g, c0b] = decode565(color0);
      const [c1r, c1g, c1b] = decode565(color1);

      colorPalette[0] = c0r;
      colorPalette[1] = c0g;
      colorPalette[2] = c0b;
      colorPalette[4] = c1r;
      colorPalette[5] = c1g;
      colorPalette[6] = c1b;

      if (color0 > color1) {
        colorPalette[8] = (2 * c0r + c1r) / 3;
        colorPalette[9] = (2 * c0g + c1g) / 3;
        colorPalette[10] = (2 * c0b + c1b) / 3;
        colorPalette[12] = (c0r + 2 * c1r) / 3;
        colorPalette[13] = (c0g + 2 * c1g) / 3;
        colorPalette[14] = (c0b + 2 * c1b) / 3;
      } else {
        colorPalette[8] = (c0r + c1r) >> 1;
        colorPalette[9] = (c0g + c1g) >> 1;
        colorPalette[10] = (c0b + c1b) >> 1;
        colorPalette[12] = 0;
        colorPalette[13] = 0;
        colorPalette[14] = 0;
      }

      if (alpha0 > alpha1) {
        alphaPalette[0] = alpha0;
        alphaPalette[1] = alpha1;
        alphaPalette[2] = (alpha0 * 6 + alpha1 + 3) / 7;
        alphaPalette[3] = (alpha0 * 5 + alpha1 * 2 + 3) / 7;
        alphaPalette[4] = (alpha0 * 4 + alpha1 * 3 + 3) / 7;
        alphaPalette[5] = (alpha0 * 3 + alpha1 * 4 + 3) / 7;
        alphaPalette[6] = (alpha0 * 2 + alpha1 * 5 + 3) / 7;
        alphaPalette[7] = (alpha0 + alpha1 * 6 + 3) / 7;
      } else {
        alphaPalette[0] = alpha0;
        alphaPalette[1] = alpha1;
        alphaPalette[2] = (alpha0 * 4 + alpha1 + 2) / 5;
        alphaPalette[3] = (alpha0 * 3 + alpha1 * 2 + 2) / 5;
        alphaPalette[4] = (alpha0 * 2 + alpha1 * 3 + 2) / 5;
        alphaPalette[5] = (alpha0 + alpha1 * 4 + 2) / 5;
        alphaPalette[6] = 0;
        alphaPalette[7] = 255;
      }

      for (let k = 0; k < 16; k++) {
        const bitOffset = k * 3;
        const byteOffset = bitOffset >> 3;
        const shift = bitOffset & 7;
        alphaIndices[k] =
          shift <= 5
            ? (alphaBits[byteOffset] >> shift) & 0x7
            : ((alphaBits[byteOffset] >> shift) |
                (alphaBits[byteOffset + 1] << (8 - shift))) &
              0x7;
      }

      const baseIndex = (y * width + x) << 2;
      for (let k = 0; k < 16; k++) {
        const j = k >> 2,
          i = k & 3;
        const idx = baseIndex + ((j * width + i) << 2);
        const colorIdx = colorBits & 0x3;
        colorBits >>>= 2;
        const alpha = alphaPalette[alphaIndices[k] & 0x7];

        rgba[idx] = colorPalette[colorIdx * 4];
        rgba[idx + 1] = colorPalette[colorIdx * 4 + 1];
        rgba[idx + 2] = colorPalette[colorIdx * 4 + 2];
        rgba[idx + 3] = alpha;

        if (premultiplied && alpha > 0 && alpha < 255) {
          const factor = 255 / alpha;
          rgba[idx] = Math.min(255, Math.round(rgba[idx] * factor));
          rgba[idx + 1] = Math.min(255, Math.round(rgba[idx + 1] * factor));
          rgba[idx + 2] = Math.min(255, Math.round(rgba[idx + 2] * factor));
        }
      }
    }
  }
  return rgba;
}
