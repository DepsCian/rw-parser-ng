import {
  decode1555,
  decode4444,
  decode555,
  decode565,
  readUInt16LE,
} from "./color";

export function bgra1555(
  data: Uint8Array,
  width: number,
  height: number,
): Uint8Array {
  const rgba = new Uint8Array(4 * width * height);
  let offset = 0;
  for (let i = 0; i < data.length; i += 2) {
    const [a, r, g, b] = decode1555(readUInt16LE(data, i));
    rgba[offset++] = r;
    rgba[offset++] = g;
    rgba[offset++] = b;
    rgba[offset++] = a;
  }
  return rgba;
}

export function bgra4444(
  data: Uint8Array,
  width: number,
  height: number,
): Uint8Array {
  const rgba = new Uint8Array(4 * width * height);
  let offset = 0;
  for (let i = 0; i < data.length; i += 2) {
    const [a, r, g, b] = decode4444(readUInt16LE(data, i));
    rgba[offset++] = r;
    rgba[offset++] = g;
    rgba[offset++] = b;
    rgba[offset++] = a;
  }
  return rgba;
}

export function bgra555(
  data: Uint8Array,
  width: number,
  height: number,
): Uint8Array {
  const rgba = new Uint8Array(4 * width * height);
  let offset = 0;
  for (let i = 0; i < data.length; i += 2) {
    const [r, g, b] = decode555(readUInt16LE(data, i));
    rgba[offset++] = r;
    rgba[offset++] = g;
    rgba[offset++] = b;
    rgba[offset++] = 0xff;
  }
  return rgba;
}

export function bgra565(
  data: Uint8Array,
  width: number,
  height: number,
): Uint8Array {
  const rgba = new Uint8Array(4 * width * height);
  let offset = 0;
  for (let i = 0; i < data.length; i += 2) {
    const [r, g, b] = decode565(readUInt16LE(data, i));
    rgba[offset++] = r;
    rgba[offset++] = g;
    rgba[offset++] = b;
    rgba[offset++] = 0xff;
  }
  return rgba;
}

export function bgra888(
  data: Uint8Array,
  width: number,
  height: number,
): Uint8Array {
  const rgba = new Uint8Array(4 * width * height);
  for (let i = 0; i < data.length; i += 4) {
    rgba[i] = data[i + 2];
    rgba[i + 1] = data[i + 1];
    rgba[i + 2] = data[i];
    rgba[i + 3] = 0xff;
  }
  return rgba;
}

export function bgra8888(
  data: Uint8Array,
  width: number,
  height: number,
): Uint8Array {
  const rgba = new Uint8Array(4 * width * height);
  for (let i = 0; i < data.length; i += 4) {
    rgba[i] = data[i + 2];
    rgba[i + 1] = data[i + 1];
    rgba[i + 2] = data[i];
    rgba[i + 3] = data[i + 3];
  }
  return rgba;
}
