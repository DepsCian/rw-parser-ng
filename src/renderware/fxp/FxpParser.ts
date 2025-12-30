import {
  FxProject,
  FxSystemBP,
  FxEmitterBP,
  FxInterpData,
  FxKeyframe,
  FxInfo,
  FxMatrix,
  FxBoundingSphere,
} from "./FxpData";

const INFO_TYPE_MAP: Record<string, string> = {
  "FX_INFO_EMRATE_DATA:": "emrate",
  "FX_INFO_EMSIZE_DATA:": "emsize",
  "FX_INFO_EMSPEED_DATA:": "emspeed",
  "FX_INFO_EMDIR_DATA:": "emdir",
  "FX_INFO_EMANGLE_DATA:": "emangle",
  "FX_INFO_EMLIFE_DATA:": "emlife",
  "FX_INFO_EMPOS_DATA:": "empos",
  "FX_INFO_EMWEATHER_DATA:": "emweather",
  "FX_INFO_EMROTATION_DATA:": "emrotation",
  "FX_INFO_NOISE_DATA:": "noise",
  "FX_INFO_FORCE_DATA:": "force",
  "FX_INFO_FRICTION_DATA:": "friction",
  "FX_INFO_ATTRACTPT_DATA:": "attractpt",
  "FX_INFO_ATTRACTLINE_DATA:": "attractline",
  "FX_INFO_GROUNDCOLLIDE_DATA:": "groundcollide",
  "FX_INFO_WIND_DATA:": "wind",
  "FX_INFO_JITTER_DATA:": "jitter",
  "FX_INFO_ROTSPEED_DATA:": "rotspeed",
  "FX_INFO_FLOAT_DATA:": "float",
  "FX_INFO_UNDERWATER_DATA:": "underwater",
  "FX_INFO_COLOUR_DATA:": "colour",
  "FX_INFO_SIZE_DATA:": "size",
  "FX_INFO_SPRITERECT_DATA:": "spriterect",
  "FX_INFO_HEATHAZE_DATA:": "heathaze",
  "FX_INFO_TRAIL_DATA:": "trail",
  "FX_INFO_FLAT_DATA:": "flat",
  "FX_INFO_DIR_DATA:": "dir",
  "FX_INFO_ANIMTEX_DATA:": "animtex",
  "FX_INFO_COLOURRANGE_DATA:": "colourrange",
  "FX_INFO_SELFLIT_DATA:": "selflit",
  "FX_INFO_COLOURBRIGHT_DATA:": "colourbright",
  "FX_INFO_SMOKE_DATA:": "smoke",
};

const INFO_INTERP_COUNTS: Record<string, number> = {
  emrate: 1,
  emsize: 7,
  emspeed: 2,
  emdir: 3,
  emangle: 2,
  emlife: 2,
  empos: 3,
  emweather: 1,
  emrotation: 2,
  noise: 3,
  force: 3,
  friction: 1,
  attractpt: 4,
  attractline: 7,
  groundcollide: 2,
  wind: 1,
  jitter: 3,
  rotspeed: 4,
  float: 1,
  colour: 4,
  size: 4,
  spriterect: 4,
  heathaze: 4,
  trail: 3,
  flat: 9,
  dir: 2,
  animtex: 2,
  colourrange: 8,
  colourbright: 5,
  smoke: 2,
};

class FxpParserImpl {
  private _lines: string[] = [];
  private _pos = 0;

  parse(content: string): FxProject {
    this._lines = content.split("\n").map((l) => l.trim());
    this._pos = 0;

    const systems = new Map<string, FxSystemBP>();
    this._expectLine("FX_PROJECT_DATA:");

    while (this._pos < this._lines.length) {
      const line = this._currentLine();
      if (!line) {
        this._pos++;
        continue;
      }

      if (line === "FX_SYSTEM_DATA:") {
        this._pos++;
        this._skipEmpty();
        const version = parseInt(this._currentLine(), 10);
        this._pos++;
        const system = this._parseSystem(version);
        systems.set(system.name, system);
      } else {
        this._pos++;
      }
    }

    return { systems };
  }

  private _parseSystem(version: number): FxSystemBP {
    this._skipEmpty();

    let filename = "";
    if (version > 100) {
      filename = this._readField("FILENAME:");
    }

    const name = this._readField("NAME:");
    const length = parseFloat(this._readField("LENGTH:"));

    let loopIntervalMin = 0;
    let loopLength = 0;
    if (version >= 106) {
      loopIntervalMin = parseFloat(this._currentLine());
      this._pos++;
      loopLength = parseFloat(this._currentLine());
      this._pos++;
    }

    const playMode = parseInt(this._readField("PLAYMODE:"), 10);
    const cullDist = parseFloat(this._readField("CULLDIST:"));

    let boundingSphere: FxBoundingSphere | null = null;
    if (version > 103) {
      const bsLine = this._readField("BOUNDINGSPHERE:");
      const parts = bsLine.split(/\s+/).map(parseFloat);
      boundingSphere = {
        x: parts[0],
        y: parts[1],
        z: parts[2],
        radius: parts[3],
      };
    }

    const numPrims = parseInt(this._readField("NUM_PRIMS:"), 10);
    const prims: FxEmitterBP[] = [];

    for (let i = 0; i < numPrims; i++) {
      this._skipEmpty();
      const primLine = this._currentLine();
      if (primLine === "FX_PRIM_EMITTER_DATA:") {
        this._pos++;
        prims.push(this._parsePrimEmitter(version));
      } else {
        this._pos++;
        i--;
      }
    }

    if (version >= 108) {
      this._skipEmpty();
      if (this._currentLine()?.startsWith("OMITTEXTURES:")) {
        this._pos++;
      }
    }

    if (version >= 109) {
      this._skipEmpty();
      if (this._currentLine()?.startsWith("TXDNAME:")) {
        this._pos++;
      }
    }

    return {
      filename,
      name,
      length,
      loopIntervalMin,
      loopLength,
      playMode,
      cullDist,
      boundingSphere,
      prims,
    };
  }

  private _parsePrimEmitter(version: number): FxEmitterBP {
    this._skipEmpty();
    this._expectLine("FX_PRIM_BASE_DATA:");

    const name = this._readField("NAME:");
    const matrix = this._parseMatrix();

    const textures: (string | null)[] = [];
    textures.push(this._readNullableTexture("TEXTURE:"));

    if (version > 101) {
      textures.push(this._readNullableTexture("TEXTURE2:"));
      textures.push(this._readNullableTexture("TEXTURE3:"));
      textures.push(this._readNullableTexture("TEXTURE4:"));
    }

    const alphaOn = this._readField("ALPHAON:") === "1";
    const srcBlendId = parseInt(this._readField("SRCBLENDID:"), 10);
    const dstBlendId = parseInt(this._readField("DSTBLENDID:"), 10);

    const numInfos = parseInt(this._readField("NUM_INFOS:"), 10);
    const infos: FxInfo[] = [];

    for (let i = 0; i < numInfos; i++) {
      this._skipEmpty();
      const infoType = this._currentLine();
      this._pos++;

      const typeKey = INFO_TYPE_MAP[infoType];
      if (!typeKey) {
        this._skipUnknownInfo();
        continue;
      }

      let timeModeParticle = true;
      const typeCode = this._getInfoTypeCode(infoType);
      if ((typeCode & 0xf000) > 0x1000 && version >= 107) {
        this._skipEmpty();
        if (this._currentLine()?.startsWith("TIMEMODEPRT:")) {
          timeModeParticle = this._readField("TIMEMODEPRT:") === "1";
        }
      }

      const info = this._parseInfo(typeKey, version);
      if (info) {
        infos.push(info);
      }
    }

    let lodStart = 0;
    let lodEnd = 0;
    this._skipEmpty();
    if (this._currentLine()?.startsWith("LODSTART:")) {
      lodStart = parseFloat(this._readField("LODSTART:"));
    }
    this._skipEmpty();
    if (this._currentLine()?.startsWith("LODEND:")) {
      lodEnd = parseFloat(this._readField("LODEND:"));
    }

    return {
      name,
      matrix,
      textures,
      alphaOn,
      srcBlendId,
      dstBlendId,
      lodStart,
      lodEnd,
      infos,
    };
  }

  private _getInfoTypeCode(infoType: string): number {
    const codes: Record<string, number> = {
      "FX_INFO_EMRATE_DATA:": 0x1001,
      "FX_INFO_EMSIZE_DATA:": 0x1004,
      "FX_INFO_EMSPEED_DATA:": 0x1008,
      "FX_INFO_EMDIR_DATA:": 0x1010,
      "FX_INFO_EMANGLE_DATA:": 0x1020,
      "FX_INFO_EMLIFE_DATA:": 0x1040,
      "FX_INFO_EMPOS_DATA:": 0x1080,
      "FX_INFO_EMWEATHER_DATA:": 0x1100,
      "FX_INFO_EMROTATION_DATA:": 0x1200,
      "FX_INFO_NOISE_DATA:": 0x2001,
      "FX_INFO_FORCE_DATA:": 0x2002,
      "FX_INFO_FRICTION_DATA:": 0x2004,
      "FX_INFO_ATTRACTPT_DATA:": 0x2008,
      "FX_INFO_ATTRACTLINE_DATA:": 0x2010,
      "FX_INFO_GROUNDCOLLIDE_DATA:": 0x2020,
      "FX_INFO_WIND_DATA:": 0x2040,
      "FX_INFO_JITTER_DATA:": 0x2080,
      "FX_INFO_ROTSPEED_DATA:": 0x2100,
      "FX_INFO_FLOAT_DATA:": 0x2200,
      "FX_INFO_UNDERWATER_DATA:": 0x2400,
      "FX_INFO_COLOUR_DATA:": 0x4001,
      "FX_INFO_SIZE_DATA:": 0x4002,
      "FX_INFO_SPRITERECT_DATA:": 0x4004,
      "FX_INFO_HEATHAZE_DATA:": 0x4008,
      "FX_INFO_TRAIL_DATA:": 0x4010,
      "FX_INFO_FLAT_DATA:": 0x4020,
      "FX_INFO_DIR_DATA:": 0x4040,
      "FX_INFO_ANIMTEX_DATA:": 0x4080,
      "FX_INFO_COLOURRANGE_DATA:": 0x4100,
      "FX_INFO_SELFLIT_DATA:": 0x4200,
      "FX_INFO_COLOURBRIGHT_DATA:": 0x4400,
      "FX_INFO_SMOKE_DATA:": 0x8001,
    };
    return codes[infoType] ?? 0;
  }

  private _parseInfo(typeKey: string, version: number): FxInfo | null {
    if (typeKey === "underwater" || typeKey === "selflit") {
      return { type: typeKey } as FxInfo;
    }

    const count = INFO_INTERP_COUNTS[typeKey];
    if (count === undefined) {
      return null;
    }

    const interps = this._parseInterps(count);

    switch (typeKey) {
      case "emrate":
        return { type: "emrate", rate: interps[0] };
      case "emsize":
        return {
          type: "emsize",
          radius: interps[0],
          sizeMinX: interps[1],
          sizeMaxX: interps[2],
          sizeMinY: interps[3],
          sizeMaxY: interps[4],
          sizeMinZ: interps[5],
          sizeMaxZ: interps[6],
        };
      case "emspeed":
        return { type: "emspeed", speed: interps[0], bias: interps[1] };
      case "emdir":
        return {
          type: "emdir",
          dirX: interps[0],
          dirY: interps[1],
          dirZ: interps[2],
        };
      case "emangle":
        return { type: "emangle", min: interps[0], max: interps[1] };
      case "emlife":
        return { type: "emlife", life: interps[0], bias: interps[1] };
      case "empos":
        return { type: "empos", x: interps[0], y: interps[1], z: interps[2] };
      case "emweather":
        return { type: "emweather", interp: interps[0] };
      case "emrotation":
        return { type: "emrotation", min: interps[0], max: interps[1] };
      case "noise":
        return { type: "noise", x: interps[0], y: interps[1], z: interps[2] };
      case "force":
        return {
          type: "force",
          forceX: interps[0],
          forceY: interps[1],
          forceZ: interps[2],
        };
      case "friction":
        return { type: "friction", friction: interps[0] };
      case "attractpt":
        return {
          type: "attractpt",
          x: interps[0],
          y: interps[1],
          z: interps[2],
          power: interps[3],
        };
      case "attractline":
        return {
          type: "attractline",
          x1: interps[0],
          y1: interps[1],
          z1: interps[2],
          x2: interps[3],
          y2: interps[4],
          z2: interps[5],
          power: interps[6],
        };
      case "groundcollide":
        return {
          type: "groundcollide",
          damping: interps[0],
          bounce: interps[1],
        };
      case "wind":
        return { type: "wind", interp: interps[0] };
      case "jitter":
        return { type: "jitter", x: interps[0], y: interps[1], z: interps[2] };
      case "rotspeed":
        return {
          type: "rotspeed",
          speed: interps[0],
          speedBias: interps[1],
          accel: interps[2],
          accelBias: interps[3],
        };
      case "float":
        return { type: "float", interp: interps[0] };
      case "colour":
        return {
          type: "colour",
          red: interps[0],
          green: interps[1],
          blue: interps[2],
          alpha: interps[3],
        };
      case "size":
        return {
          type: "size",
          sizeX: interps[0],
          sizeY: interps[1],
          sizeXBias: interps[2],
          sizeYBias: interps[3],
        };
      case "spriterect":
        return { type: "spriterect", interps };
      case "heathaze":
        return { type: "heathaze", interps };
      case "trail":
        return { type: "trail", interps };
      case "flat":
        return {
          type: "flat",
          rightX: interps[0],
          rightY: interps[1],
          rightZ: interps[2],
          upX: interps[3],
          upY: interps[4],
          upZ: interps[5],
          atX: interps[6],
          atY: interps[7],
          atZ: interps[8],
        };
      case "dir":
        return { type: "dir", interps };
      case "animtex":
        return { type: "animtex", interps };
      case "colourrange":
        return {
          type: "colourrange",
          redMin: interps[0],
          redMax: interps[1],
          greenMin: interps[2],
          greenMax: interps[3],
          blueMin: interps[4],
          blueMax: interps[5],
          alphaMin: interps[6],
          alphaMax: interps[7],
        };
      case "colourbright":
        return {
          type: "colourbright",
          red: interps[0],
          green: interps[1],
          blue: interps[2],
          alpha: interps[3],
          brightness: interps[4],
        };
      case "smoke":
        return { type: "smoke", interps };
      default:
        return null;
    }
  }

  private _parseInterps(count: number): FxInterpData[] {
    const result: FxInterpData[] = [];
    for (let i = 0; i < count; i++) {
      this._skipEmpty();
      this._pos++;
      result.push(this._parseInterpolation());
    }
    return result;
  }

  private _parseInterpolation(): FxInterpData {
    this._expectLine("FX_INTERP_DATA:");
    const looped = this._readField("LOOPED:") === "1";
    const numKeys = parseInt(this._readField("NUM_KEYS:"), 10);

    const keys: FxKeyframe[] = [];
    for (let i = 0; i < numKeys; i++) {
      this._expectLine("FX_KEYFLOAT_DATA:");
      const time = parseFloat(this._readField("TIME:"));
      const value = parseFloat(this._readField("VAL:"));
      keys.push({ time, value });
    }

    return { looped, keys };
  }

  private _parseMatrix(): FxMatrix {
    this._skipEmpty();
    const line = this._currentLine();
    if (!line?.startsWith("MATRIX:")) {
      return {
        right: { x: 1, y: 0, z: 0 },
        up: { x: 0, y: 1, z: 0 },
        at: { x: 0, y: 0, z: 1 },
        pos: { x: 0, y: 0, z: 0 },
      };
    }

    const parts = line.slice(7).trim().split(/\s+/).map(parseFloat);
    this._pos++;

    return {
      right: { x: parts[0], y: parts[1], z: parts[2] },
      up: { x: parts[3], y: parts[4], z: parts[5] },
      at: { x: parts[6], y: parts[7], z: parts[8] },
      pos: { x: parts[9], y: parts[10], z: parts[11] },
    };
  }

  private _skipUnknownInfo(): void {
    while (this._pos < this._lines.length) {
      const line = this._currentLine();
      if (
        !line ||
        line.startsWith("FX_INFO_") ||
        line.startsWith("LODSTART:") ||
        line.startsWith("FX_PRIM_") ||
        line.startsWith("FX_SYSTEM_DATA:")
      ) {
        break;
      }
      if (line === "FX_INTERP_DATA:") {
        this._pos++;
        this._skipEmpty();
        if (this._currentLine()?.startsWith("LOOPED:")) this._pos++;
        this._skipEmpty();
        const numKeysLine = this._currentLine();
        let numKeys = 0;
        if (numKeysLine?.startsWith("NUM_KEYS:")) {
          numKeys = parseInt(numKeysLine.slice(9).trim(), 10);
          this._pos++;
        }
        for (let i = 0; i < numKeys; i++) {
          this._skipEmpty();
          if (this._currentLine() === "FX_KEYFLOAT_DATA:") this._pos++;
          this._skipEmpty();
          if (this._currentLine()?.startsWith("TIME:")) this._pos++;
          this._skipEmpty();
          if (this._currentLine()?.startsWith("VAL:")) this._pos++;
        }
      } else {
        this._pos++;
      }
    }
  }

  private _readField(prefix: string): string {
    this._skipEmpty();
    const line = this._currentLine();
    if (!line?.startsWith(prefix)) {
      return "";
    }
    this._pos++;
    return line.slice(prefix.length).trim();
  }

  private _readNullableTexture(prefix: string): string | null {
    const val = this._readField(prefix);
    return val === "NULL" || val === "" ? null : val;
  }

  private _expectLine(expected: string): void {
    this._skipEmpty();
    if (this._currentLine() === expected) {
      this._pos++;
    }
  }

  private _skipEmpty(): void {
    while (
      this._pos < this._lines.length &&
      this._lines[this._pos].trim() === ""
    ) {
      this._pos++;
    }
  }

  private _currentLine(): string {
    return this._lines[this._pos] ?? "";
  }
}

export function parseFxpContent(content: string): FxProject {
  const parser = new FxpParserImpl();
  return parser.parse(content);
}

export function parseFxpFile(filePath: string): FxProject {
  const fs = require("fs");
  const content = fs.readFileSync(filePath, "utf-8");
  return parseFxpContent(content);
}
