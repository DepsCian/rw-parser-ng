export function readUInt16LE(buf: Uint8Array, offset: number): number {
  return buf[offset] | (buf[offset + 1] << 8);
}

export function readUInt32LE(buf: Uint8Array, offset: number): number {
  return buf[offset] | (buf[offset + 1] << 8) | (buf[offset + 2] << 16) | (buf[offset + 3] << 24);
}

export function decode565(bits: number): [number, number, number] {
  const r = (bits >> 11) & 0b11111;
  const g = (bits >> 5) & 0b111111;
  const b = bits & 0b11111;
  return [(r << 3) | (r >> 2), (g << 2) | (g >> 4), (b << 3) | (b >> 2)];
}

export function decode555(bits: number): [number, number, number] {
  return [
    Math.round((((bits >> 10) & 0b11111) * 255) / 31),
    Math.round((((bits >> 5) & 0b11111) * 255) / 31),
    Math.round(((bits & 0b11111) * 255) / 31),
  ];
}

export function decode1555(bits: number): [number, number, number, number] {
  return [
    Math.round(((bits >> 15) & 0b1) * 255),
    Math.round((((bits >> 10) & 0b11111) * 255) / 31),
    Math.round((((bits >> 5) & 0b11111) * 255) / 31),
    Math.round(((bits & 0b11111) * 255) / 31),
  ];
}

export function decode4444(bits: number): [number, number, number, number] {
  return [
    Math.round((((bits >> 12) & 0b1111) * 255) / 15),
    Math.round((((bits >> 8) & 0b1111) * 255) / 15),
    Math.round((((bits >> 4) & 0b1111) * 255) / 15),
    Math.round(((bits & 0b1111) * 255) / 15),
  ];
}
