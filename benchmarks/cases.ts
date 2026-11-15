import { readdirSync, readFileSync } from "node:fs";
import { bc1, bc2, bc3 } from "../lib/codecs/dxt";
import { ByteStream, DffParser, IfpParser, parseFxpContent, TxdParser } from "../lib/index";

export interface Workload {
  name: string;
  inputBytes: number;
  consumedBytes?: number;
  outputBytes?: number;
  run: () => number;
}

export function workloads(): Workload[] {
  const cases: Workload[] = [];
  for (const name of readdirSync("tests/assets")) {
    if (!/\.(dff|ifp|txd)$/.test(name)) continue;
    const input = readFileSync(`tests/assets/${name}`);
    if (name.endsWith(".dff")) {
      const baseline = new DffParser(input);
      const expected = baseline.parse().geometryList.geometries.length;
      if (!expected) throw new Error(`Empty geometry: ${name}`);
      cases.push({
        name,
        inputBytes: input.length,
        consumedBytes: baseline.getPosition(),
        run: () => new DffParser(input).parse().geometryList.geometries.length,
      });
    } else if (name.endsWith(".ifp")) {
      const baseline = new IfpParser(input);
      const expected = baseline.parse().animations.length;
      if (!expected) throw new Error(`Empty animations: ${name}`);
      cases.push({
        name,
        inputBytes: input.length,
        consumedBytes: baseline.getPosition(),
        run: () => new IfpParser(input).parse().animations.length,
      });
    } else {
      const baseline = new TxdParser(input);
      const textures = baseline.parse().textureDictionary.textureNatives;
      if (!textures.length || textures.some((t) => !t.mipmaps[0]?.length)) {
        throw new Error(`Empty pixels: ${name}`);
      }
      cases.push({
        name,
        inputBytes: input.length,
        consumedBytes: baseline.getPosition(),
        outputBytes: textures.reduce((sum, t) => sum + t.mipmaps[0].length, 0),
        run: () =>
          new TxdParser(input).parse().textureDictionary.textureNatives[0].mipmaps[0][0] + 1,
      });
    }
  }
  const fxp = readFileSync("tests/assets/effects.fxp", "utf8");
  if (!parseFxpContent(fxp).systems.size) throw new Error("Empty FXP systems");
  cases.push({
    name: "FXP",
    inputBytes: Buffer.byteLength(fxp),
    run: () => parseFxpContent(fxp).systems.size,
  });
  const bytes = Buffer.alloc(8192, 1);
  for (const method of ["readUint8", "readUint16", "readUint32", "readFloat"] as const) {
    const size = method === "readUint8" ? 1 : method === "readUint16" ? 2 : 4;
    cases.push({
      name: `cursor/${method}`,
      inputBytes: bytes.length,
      run: () => {
        const stream = new ByteStream(bytes);
        let sum = 0;
        for (let offset = 0; offset < bytes.length; offset += size) sum += stream[method]();
        return sum;
      },
    });
  }
  cases.push({
    name: "cursor/copy",
    inputBytes: bytes.length,
    run: () => new ByteStream(bytes).readBytes(bytes.length)[0],
  });
  cases.push({
    name: "cursor/view",
    inputBytes: bytes.length,
    run: () => new ByteStream(bytes).readView(bytes.length)[0],
  });
  for (const [name, blockSize, decode] of [
    ["BC1", 8, bc1],
    ["BC2", 16, bc2],
    ["BC3", 16, bc3],
  ] as const) {
    const input = new Uint8Array(64 * 64 * blockSize).fill(127);
    cases.push({
      name,
      inputBytes: input.length,
      outputBytes: 256 * 256 * 4,
      run: () => decode(input, 256, 256, false)[0] + 1,
    });
  }
  return cases;
}
