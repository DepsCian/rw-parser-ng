import { parseInfo } from "./info-parser";
import {
  FxBoundingSphere,
  FxEmitterBP,
  FxInfo,
  FxInterpData,
  FxKeyframe,
  FxMatrix,
  FxProject,
  FxSystemBP,
} from "./types";

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

    const filename = version > 100 ? this._readField("FILENAME:") : "";
    const name = this._readField("NAME:");
    const length = parseFloat(this._readField("LENGTH:"));

    let loopIntervalMin = 0,
      loopLength = 0;
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
      const parts = this._readField("BOUNDINGSPHERE:")
        .split(/\s+/)
        .map(parseFloat);
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
      if (this._currentLine() === "FX_PRIM_EMITTER_DATA:") {
        this._pos++;
        prims.push(this._parsePrimEmitter(version));
      } else {
        this._pos++;
        i--;
      }
    }

    if (version >= 108) {
      this._skipEmpty();
      if (this._currentLine()?.startsWith("OMITTEXTURES:")) this._pos++;
    }
    if (version >= 109) {
      this._skipEmpty();
      if (this._currentLine()?.startsWith("TXDNAME:")) this._pos++;
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

    const textures: (string | null)[] = [this._readNullableTexture("TEXTURE:")];
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
      if (this._currentLine()?.startsWith("TIMEMODEPRT:")) this._pos++;

      const interps =
        typeKey === "underwater" || typeKey === "selflit"
          ? {}
          : this._parseAllInterps();
      const info = parseInfo(typeKey, interps);
      if (info) infos.push(info);
    }

    let lodStart = 0,
      lodEnd = 0;
    this._skipEmpty();
    if (this._currentLine()?.startsWith("LODSTART:"))
      lodStart = parseFloat(this._readField("LODSTART:"));
    this._skipEmpty();
    if (this._currentLine()?.startsWith("LODEND:"))
      lodEnd = parseFloat(this._readField("LODEND:"));

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

  private _parseAllInterps(): Record<string, FxInterpData> {
    const result: Record<string, FxInterpData> = {};

    while (this._pos < this._lines.length) {
      this._skipEmpty();
      const line = this._currentLine();
      if (this._isBlockEnd(line)) break;

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
      keys.push({
        time: parseFloat(this._readField("TIME:")),
        value: parseFloat(this._readField("VAL:")),
      });
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

    const p = line.slice(7).trim().split(/\s+/).map(parseFloat);
    this._pos++;

    return {
      right: { x: p[0], y: p[1], z: p[2] },
      up: { x: p[3], y: p[4], z: p[5] },
      at: { x: p[6], y: p[7], z: p[8] },
      pos: { x: p[9], y: p[10], z: p[11] },
    };
  }

  private _skipUnknownInfo(): void {
    while (
      this._pos < this._lines.length &&
      !this._isBlockEnd(this._currentLine())
    )
      this._pos++;
  }

  private _readField(prefix: string): string {
    this._skipEmpty();
    const line = this._currentLine();
    if (!line?.startsWith(prefix)) return "";
    this._pos++;
    return line.slice(prefix.length).trim();
  }

  private _readNullableTexture(prefix: string): string | null {
    const val = this._readField(prefix);
    return val === "NULL" || val === "" ? null : val;
  }

  private _expectLine(expected: string): void {
    this._skipEmpty();
    if (this._currentLine() === expected) this._pos++;
  }

  private _skipEmpty(): void {
    while (
      this._pos < this._lines.length &&
      this._lines[this._pos].trim() === ""
    )
      this._pos++;
  }

  private _currentLine(): string {
    return this._lines[this._pos] ?? "";
  }
}

export function parseFxpContent(content: string): FxProject {
  return new FxpParserImpl().parse(content);
}

export function parseFxpFile(filePath: string): FxProject {
  const fs = require("fs");
  return parseFxpContent(fs.readFileSync(filePath, "utf-8"));
}
