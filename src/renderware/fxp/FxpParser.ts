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

      this._skipEmpty();
      if (this._currentLine()?.startsWith("TIMEMODEPRT:")) {
        this._pos++;
      }

      const info = this._parseInfo(typeKey);
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

  private _parseInfo(typeKey: string): FxInfo | null {
    if (typeKey === "underwater" || typeKey === "selflit") {
      return { type: typeKey } as FxInfo;
    }

    const interps = this._parseAllInterps();

    switch (typeKey) {
      case "emrate":
        return {
          type: "emrate",
          rate: interps["RATE"] ?? this._defaultInterp(),
        };
      case "emsize":
        return {
          type: "emsize",
          radius: interps["RADIUS"] ?? this._defaultInterp(),
          sizeMinX: interps["SIZEMINX"] ?? this._defaultInterp(),
          sizeMaxX: interps["SIZEMAXX"] ?? this._defaultInterp(),
          sizeMinY: interps["SIZEMINY"] ?? this._defaultInterp(),
          sizeMaxY: interps["SIZEMAXY"] ?? this._defaultInterp(),
          sizeMinZ: interps["SIZEMINZ"] ?? this._defaultInterp(),
          sizeMaxZ: interps["SIZEMAXZ"] ?? this._defaultInterp(),
        };
      case "emspeed":
        return {
          type: "emspeed",
          speed: interps["SPEED"] ?? this._defaultInterp(),
          bias: interps["BIAS"] ?? this._defaultInterp(),
        };
      case "emdir":
        return {
          type: "emdir",
          dirX: interps["DIRX"] ?? this._defaultInterp(),
          dirY: interps["DIRY"] ?? this._defaultInterp(),
          dirZ: interps["DIRZ"] ?? this._defaultInterp(),
        };
      case "emangle":
        return {
          type: "emangle",
          min: interps["MIN"] ?? interps["ANGLEMIN"] ?? this._defaultInterp(),
          max: interps["MAX"] ?? interps["ANGLEMAX"] ?? this._defaultInterp(),
        };
      case "emlife":
        return {
          type: "emlife",
          life: interps["LIFE"] ?? this._defaultInterp(),
          bias: interps["BIAS"] ?? this._defaultInterp(),
        };
      case "empos":
        return {
          type: "empos",
          x: interps["X"] ?? this._defaultInterp(),
          y: interps["Y"] ?? this._defaultInterp(),
          z: interps["Z"] ?? this._defaultInterp(),
        };
      case "emweather":
        return {
          type: "emweather",
          interp: interps["WEATHER"] ?? this._defaultInterp(),
        };
      case "emrotation":
        return {
          type: "emrotation",
          min: interps["ANGLEMIN"] ?? this._defaultInterp(),
          max: interps["ANGLEMAX"] ?? this._defaultInterp(),
        };
      case "noise":
        return {
          type: "noise",
          x: interps["NOISE"] ?? interps["X"] ?? this._defaultInterp(),
          y: interps["Y"] ?? this._defaultInterp(),
          z: interps["Z"] ?? this._defaultInterp(),
        };
      case "force":
        return {
          type: "force",
          forceX: interps["FORCEX"] ?? this._defaultInterp(),
          forceY: interps["FORCEY"] ?? this._defaultInterp(),
          forceZ: interps["FORCEZ"] ?? this._defaultInterp(),
        };
      case "friction":
        return {
          type: "friction",
          friction: interps["FRICTION"] ?? this._defaultInterp(),
        };
      case "attractpt":
        return {
          type: "attractpt",
          x: interps["X"] ?? this._defaultInterp(),
          y: interps["Y"] ?? this._defaultInterp(),
          z: interps["Z"] ?? this._defaultInterp(),
          power: interps["POWER"] ?? this._defaultInterp(),
        };
      case "attractline":
        return {
          type: "attractline",
          x1: interps["X1"] ?? this._defaultInterp(),
          y1: interps["Y1"] ?? this._defaultInterp(),
          z1: interps["Z1"] ?? this._defaultInterp(),
          x2: interps["X2"] ?? this._defaultInterp(),
          y2: interps["Y2"] ?? this._defaultInterp(),
          z2: interps["Z2"] ?? this._defaultInterp(),
          power: interps["POWER"] ?? this._defaultInterp(),
        };
      case "groundcollide":
        return {
          type: "groundcollide",
          damping: interps["DAMPING"] ?? this._defaultInterp(),
          bounce: interps["BOUNCE"] ?? this._defaultInterp(),
        };
      case "wind":
        return {
          type: "wind",
          interp: interps["WINDFACTOR"] ?? this._defaultInterp(),
        };
      case "jitter":
        return {
          type: "jitter",
          x: interps["X"] ?? this._defaultInterp(),
          y: interps["Y"] ?? this._defaultInterp(),
          z: interps["Z"] ?? this._defaultInterp(),
        };
      case "rotspeed":
        return {
          type: "rotspeed",
          speed: interps["SPEED"] ?? this._defaultInterp(),
          speedBias: interps["SPEEDBIAS"] ?? this._defaultInterp(),
          accel: interps["ACCEL"] ?? this._defaultInterp(),
          accelBias: interps["ACCELBIAS"] ?? this._defaultInterp(),
        };
      case "float":
        return {
          type: "float",
          interp: interps["FLOAT"] ?? this._defaultInterp(),
        };
      case "colour":
        return {
          type: "colour",
          red: interps["RED"] ?? this._defaultInterp(),
          green: interps["GREEN"] ?? this._defaultInterp(),
          blue: interps["BLUE"] ?? this._defaultInterp(),
          alpha: interps["ALPHA"] ?? this._defaultInterp(),
        };
      case "size":
        return {
          type: "size",
          sizeX: interps["SIZEX"] ?? this._defaultInterp(),
          sizeY: interps["SIZEY"] ?? this._defaultInterp(),
          sizeXBias: interps["SIZEXBIAS"] ?? this._defaultInterp(),
          sizeYBias: interps["SIZEYBIAS"] ?? this._defaultInterp(),
        };
      case "spriterect":
        return { type: "spriterect", interps: Object.values(interps) };
      case "heathaze":
        return { type: "heathaze", interps: Object.values(interps) };
      case "trail":
        return { type: "trail", interps: Object.values(interps) };
      case "flat":
        return {
          type: "flat",
          rightX: interps["RIGHTX"] ?? this._defaultInterp(),
          rightY: interps["RIGHTY"] ?? this._defaultInterp(),
          rightZ: interps["RIGHTZ"] ?? this._defaultInterp(),
          upX: interps["UPX"] ?? this._defaultInterp(),
          upY: interps["UPY"] ?? this._defaultInterp(),
          upZ: interps["UPZ"] ?? this._defaultInterp(),
          atX: interps["ATX"] ?? this._defaultInterp(),
          atY: interps["ATY"] ?? this._defaultInterp(),
          atZ: interps["ATZ"] ?? this._defaultInterp(),
        };
      case "dir":
        return { type: "dir", interps: Object.values(interps) };
      case "animtex":
        return { type: "animtex", interps: Object.values(interps) };
      case "colourrange":
        return {
          type: "colourrange",
          redMin: interps["REDMIN"] ?? this._defaultInterp(),
          redMax: interps["REDMAX"] ?? this._defaultInterp(),
          greenMin: interps["GREENMIN"] ?? this._defaultInterp(),
          greenMax: interps["GREENMAX"] ?? this._defaultInterp(),
          blueMin: interps["BLUEMIN"] ?? this._defaultInterp(),
          blueMax: interps["BLUEMAX"] ?? this._defaultInterp(),
          alphaMin: interps["ALPHAMIN"] ?? this._defaultInterp(),
          alphaMax: interps["ALPHAMAX"] ?? this._defaultInterp(),
        };
      case "colourbright":
        return {
          type: "colourbright",
          red: interps["RED"] ?? this._defaultInterp(),
          green: interps["GREEN"] ?? this._defaultInterp(),
          blue: interps["BLUE"] ?? this._defaultInterp(),
          alpha: interps["ALPHA"] ?? this._defaultInterp(),
          brightness:
            interps["BRIGHTNESS"] ?? interps["BIAS"] ?? this._defaultInterp(),
        };
      case "smoke":
        return { type: "smoke", interps: Object.values(interps) };
      default:
        return null;
    }
  }

  private _defaultInterp(): FxInterpData {
    return { looped: false, keys: [] };
  }

  private _parseAllInterps(): Record<string, FxInterpData> {
    const result: Record<string, FxInterpData> = {};

    while (this._pos < this._lines.length) {
      this._skipEmpty();
      const line = this._currentLine();

      if (this._isBlockEnd(line)) {
        break;
      }

      if (line.endsWith(":") && !line.startsWith("FX_")) {
        const fieldName = line.slice(0, -1).toUpperCase();
        this._pos++;

        this._skipEmpty();
        if (this._currentLine() === "FX_INTERP_DATA:") {
          result[fieldName] = this._parseInterpolation();
        }
      } else {
        this._pos++;
      }
    }

    return result;
  }

  private _isBlockEnd(line: string): boolean {
    return (
      !line ||
      line.startsWith("FX_INFO_") ||
      line.startsWith("LODSTART:") ||
      line.startsWith("LODEND:") ||
      line.startsWith("FX_PRIM_") ||
      line.startsWith("FX_SYSTEM_DATA:") ||
      line.startsWith("OMITTEXTURES:") ||
      line.startsWith("TXDNAME:")
    );
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
      if (this._isBlockEnd(line)) {
        break;
      }
      this._pos++;
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
