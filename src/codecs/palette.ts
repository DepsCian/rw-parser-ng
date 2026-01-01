export function lum8(data: Uint8Array, width: number, height: number): Uint8Array {
  const rgba = new Uint8Array(4 * width * height);
  for (let i = 0; i < data.length; i++) {
    const offset = i * 4;
    const lum = data[i];
    rgba[offset] = lum;
    rgba[offset + 1] = lum;
    rgba[offset + 2] = lum;
    rgba[offset + 3] = 0xff;
  }
  return rgba;
}

export function lum8a8(data: Uint8Array, width: number, height: number): Uint8Array {
  const rgba = new Uint8Array(4 * width * height);
  let offset = 0;
  for (let i = 0; i < data.length; i += 2) {
    const lum = data[i],
      alpha = data[i + 1];
    rgba[offset++] = lum;
    rgba[offset++] = lum;
    rgba[offset++] = lum;
    rgba[offset++] = alpha;
  }
  return rgba;
}

export function pal4(
  data: Uint8Array,
  palette: Uint8Array,
  width: number,
  height: number,
): Uint8Array {
  const rgba = new Uint8Array(4 * width * height);
  let offset = 0;
  for (let i = 0; i < data.length; i++) {
    const idx1 = (data[i] >> 4) & 0xf,
      idx2 = data[i] & 0xf;
    rgba[offset++] = palette[idx1 * 4];
    rgba[offset++] = palette[idx1 * 4 + 1];
    rgba[offset++] = palette[idx1 * 4 + 2];
    rgba[offset++] = palette[idx1 * 4 + 3];
    rgba[offset++] = palette[idx2 * 4];
    rgba[offset++] = palette[idx2 * 4 + 1];
    rgba[offset++] = palette[idx2 * 4 + 2];
    rgba[offset++] = palette[idx2 * 4 + 3];
  }
  return rgba;
}

export function pal4NoAlpha(
  data: Uint8Array,
  palette: Uint8Array,
  width: number,
  height: number,
): Uint8Array {
  const rgba = new Uint8Array(4 * width * height);
  let offset = 0;
  for (let i = 0; i < data.length; i++) {
    const idx1 = (data[i] >> 4) & 0xf,
      idx2 = data[i] & 0xf;
    rgba[offset++] = palette[idx1 * 4];
    rgba[offset++] = palette[idx1 * 4 + 1];
    rgba[offset++] = palette[idx1 * 4 + 2];
    rgba[offset++] = 0xff;
    rgba[offset++] = palette[idx2 * 4];
    rgba[offset++] = palette[idx2 * 4 + 1];
    rgba[offset++] = palette[idx2 * 4 + 2];
    rgba[offset++] = 0xff;
  }
  return rgba;
}

export function pal8(
  data: Uint8Array,
  palette: Uint8Array,
  width: number,
  height: number,
): Uint8Array {
  const rgba = new Uint8Array(4 * width * height);
  for (let i = 0; i < data.length; i++) {
    const idx = data[i];
    rgba[i * 4] = palette[idx * 4];
    rgba[i * 4 + 1] = palette[idx * 4 + 1];
    rgba[i * 4 + 2] = palette[idx * 4 + 2];
    rgba[i * 4 + 3] = palette[idx * 4 + 3];
  }
  return rgba;
}

export function pal8NoAlpha(
  data: Uint8Array,
  palette: Uint8Array,
  width: number,
  height: number,
): Uint8Array {
  const rgba = new Uint8Array(4 * width * height);
  for (let i = 0; i < data.length; i++) {
    const idx = data[i];
    rgba[i * 4] = palette[idx * 4];
    rgba[i * 4 + 1] = palette[idx * 4 + 1];
    rgba[i * 4 + 2] = palette[idx * 4 + 2];
    rgba[i * 4 + 3] = 0xff;
  }
  return rgba;
}
