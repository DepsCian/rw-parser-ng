import { decodeTextureMipmap, TxdParser } from "../lib/index";
import type { Workload } from "./cases";

export function textureFixture(
  width: number,
  height: number,
  format = "DXT1",
  paletteType = 0,
): Buffer {
  const levels: Buffer[] = [];
  const compressed = format.startsWith("DXT");
  let w = width,
    h = height;
  for (;;) {
    const size = compressed
      ? Math.ceil(w / 4) * Math.ceil(h / 4) * (format === "DXT1" ? 8 : 16)
      : paletteType
        ? Math.ceil((w * h) / (paletteType === 2 ? 2 : 1))
        : w * h * 4;
    const prefix = Buffer.alloc(4);
    prefix.writeUInt32LE(size);
    levels.push(Buffer.concat([prefix, Buffer.alloc(size, 0x11)]));
    if (w === 1 && h === 1) break;
    w = Math.max(1, Math.floor(w / 2));
    h = Math.max(1, Math.floor(h / 2));
  }
  const metadata = Buffer.alloc(88);
  metadata.writeUInt32LE(9);
  metadata.write("benchmark", 8, "ascii");
  metadata.writeUInt32LE((paletteType << 13) | 0x500, 72);
  metadata.write(format, 76, 4, "ascii");
  metadata.writeUInt16LE(width, 80);
  metadata.writeUInt16LE(height, 82);
  metadata[84] = paletteType === 2 ? 4 : paletteType ? 8 : 32;
  metadata[85] = levels.length;
  metadata[86] = 4;
  metadata[87] = compressed ? 8 : 1;
  const palette = Buffer.alloc(paletteType === 1 ? 1024 : paletteType === 2 ? 64 : 0, 255);
  const native = section(
    0x15,
    Buffer.concat([
      section(1, Buffer.concat([metadata, palette, ...levels])),
      section(3, Buffer.alloc(0)),
    ]),
  );
  const count = Buffer.from([1, 0, 0, 0]);
  return section(0x16, Buffer.concat([section(1, count), native, section(3, Buffer.alloc(0))]));
}

function section(type: number, data: Buffer): Buffer {
  const header = Buffer.alloc(12);
  header.writeUInt32LE(type);
  header.writeUInt32LE(data.length, 4);
  header.writeUInt32LE(0x1803ffff, 8);
  return Buffer.concat([header, data]);
}

export function textureWorkloads(): Workload[] {
  const input = textureFixture(512, 512);
  const texture = new TxdParser(input).parseStructure().textureDictionary.textureNatives[0];
  if (texture.mipmaps.length !== 10) throw new Error("Invalid mip chain");
  const cases: Workload[] = [
    {
      name: "TXD/structure",
      inputBytes: input.length,
      run: () =>
        new TxdParser(input).parseStructure().textureDictionary.textureNatives[0].mipmaps.length,
    },
    {
      name: "TXD/legacy",
      inputBytes: input.length,
      run: () => new TxdParser(input).parse().textureDictionary.textureNatives[0].mipmaps[0][0] + 1,
    },
  ];
  for (let level = 0; level < texture.mipmaps.length; level++) {
    const mip = texture.mipmaps[level];
    cases.push({
      name: `TXD/decode-level-${level}`,
      inputBytes: mip.data.length,
      outputBytes: mip.width * mip.height * 4,
      run: () => decodeTextureMipmap(texture, level)[0] + 1,
    });
  }
  cases.push({
    name: "TXD/decode-chain",
    inputBytes: texture.mipmaps.reduce((sum, mip) => sum + mip.data.length, 0),
    outputBytes: texture.mipmaps.reduce((sum, mip) => sum + mip.width * mip.height * 4, 0),
    run: () => {
      let sum = 0;
      for (let level = 0; level < texture.mipmaps.length; level++)
        sum += decodeTextureMipmap(texture, level)[0] + 1;
      return sum;
    },
  });
  return cases;
}
