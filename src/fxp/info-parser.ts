import type { FxInfo, FxInterpData } from "./types";

const DEFAULT_INTERP: FxInterpData = { looped: false, keys: [] };

export function parseInfo(typeKey: string, interps: Record<string, FxInterpData>): FxInfo | null {
  const get = (key: string, ...alt: string[]) =>
    interps[key] ??
    alt.reduce((r, k) => r ?? interps[k], undefined as FxInterpData | undefined) ??
    DEFAULT_INTERP;

  switch (typeKey) {
    case "underwater":
    case "selflit":
      return { type: typeKey } as FxInfo;
    case "emrate":
      return { type: "emrate", rate: get("RATE") };
    case "emsize":
      return {
        type: "emsize",
        radius: get("RADIUS"),
        sizeMinX: get("SIZEMINX"),
        sizeMaxX: get("SIZEMAXX"),
        sizeMinY: get("SIZEMINY"),
        sizeMaxY: get("SIZEMAXY"),
        sizeMinZ: get("SIZEMINZ"),
        sizeMaxZ: get("SIZEMAXZ"),
      };
    case "emspeed":
      return { type: "emspeed", speed: get("SPEED"), bias: get("BIAS") };
    case "emdir":
      return {
        type: "emdir",
        dirX: get("DIRX"),
        dirY: get("DIRY"),
        dirZ: get("DIRZ"),
      };
    case "emangle":
      return {
        type: "emangle",
        min: get("MIN", "ANGLEMIN"),
        max: get("MAX", "ANGLEMAX"),
      };
    case "emlife":
      return { type: "emlife", life: get("LIFE"), bias: get("BIAS") };
    case "empos":
      return { type: "empos", x: get("X"), y: get("Y"), z: get("Z") };
    case "emweather":
      return { type: "emweather", interp: get("WEATHER") };
    case "emrotation":
      return { type: "emrotation", min: get("ANGLEMIN"), max: get("ANGLEMAX") };
    case "noise":
      return { type: "noise", x: get("NOISE", "X"), y: get("Y"), z: get("Z") };
    case "force":
      return {
        type: "force",
        forceX: get("FORCEX"),
        forceY: get("FORCEY"),
        forceZ: get("FORCEZ"),
      };
    case "friction":
      return { type: "friction", friction: get("FRICTION") };
    case "attractpt":
      return {
        type: "attractpt",
        x: get("X"),
        y: get("Y"),
        z: get("Z"),
        power: get("POWER"),
      };
    case "attractline":
      return {
        type: "attractline",
        x1: get("X1"),
        y1: get("Y1"),
        z1: get("Z1"),
        x2: get("X2"),
        y2: get("Y2"),
        z2: get("Z2"),
        power: get("POWER"),
      };
    case "groundcollide":
      return {
        type: "groundcollide",
        damping: get("DAMPING"),
        bounce: get("BOUNCE"),
      };
    case "wind":
      return { type: "wind", interp: get("WINDFACTOR") };
    case "jitter":
      return { type: "jitter", x: get("X"), y: get("Y"), z: get("Z") };
    case "rotspeed":
      return {
        type: "rotspeed",
        speed: get("SPEED"),
        speedBias: get("SPEEDBIAS"),
        accel: get("ACCEL"),
        accelBias: get("ACCELBIAS"),
      };
    case "float":
      return { type: "float", interp: get("FLOAT") };
    case "colour":
      return {
        type: "colour",
        red: get("RED"),
        green: get("GREEN"),
        blue: get("BLUE"),
        alpha: get("ALPHA"),
      };
    case "size":
      return {
        type: "size",
        sizeX: get("SIZEX"),
        sizeY: get("SIZEY"),
        sizeXBias: get("SIZEXBIAS"),
        sizeYBias: get("SIZEYBIAS"),
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
        rightX: get("RIGHTX"),
        rightY: get("RIGHTY"),
        rightZ: get("RIGHTZ"),
        upX: get("UPX"),
        upY: get("UPY"),
        upZ: get("UPZ"),
        atX: get("ATX"),
        atY: get("ATY"),
        atZ: get("ATZ"),
      };
    case "dir":
      return { type: "dir", interps: Object.values(interps) };
    case "animtex":
      return { type: "animtex", interps: Object.values(interps) };
    case "colourrange":
      return {
        type: "colourrange",
        redMin: get("REDMIN"),
        redMax: get("REDMAX"),
        greenMin: get("GREENMIN"),
        greenMax: get("GREENMAX"),
        blueMin: get("BLUEMIN"),
        blueMax: get("BLUEMAX"),
        alphaMin: get("ALPHAMIN"),
        alphaMax: get("ALPHAMAX"),
      };
    case "colourbright":
      return {
        type: "colourbright",
        red: get("RED"),
        green: get("GREEN"),
        blue: get("BLUE"),
        alpha: get("ALPHA"),
        brightness: get("BRIGHTNESS", "BIAS"),
      };
    case "smoke":
      return { type: "smoke", interps: Object.values(interps) };
    default:
      return null;
  }
}
