import type { RwFile } from "../../core/rw-file";
import {
  Rw2dEffectType,
  type Rw2dEffect,
  type Rw2dEffectAttractor,
  type Rw2dEffectCoverPoint,
  type Rw2dEffectEnEx,
  type Rw2dEffectEscalator,
  type Rw2dEffectGeneric,
  type Rw2dEffectLight,
  type Rw2dEffectParticle,
  type Rw2dEffectRoadsign,
} from "../types";

export function read2dEffects(file: RwFile, sectionSize: number): Rw2dEffect[] {
  const effects: Rw2dEffect[] = [];
  const endPosition = file.getPosition() + sectionSize;
  const effectCount = file.readUint32();

  for (let i = 0; i < effectCount && file.getPosition() < endPosition; i++) {
    const effect = read2dEffect(file);
    if (effect) effects.push(effect);
  }

  file.setPosition(endPosition);
  return effects;
}

function read2dEffect(file: RwFile): Rw2dEffect | null {
  const position = {
    x: file.readFloat(),
    y: file.readFloat(),
    z: file.readFloat(),
  };
  const type = file.readUint32() as Rw2dEffectType;
  const dataSize = file.readUint32();
  const dataStart = file.getPosition();

  let effect: Rw2dEffect | null = null;

  switch (type) {
    case Rw2dEffectType.LIGHT:
      effect = readLight(file, position);
      break;
    case Rw2dEffectType.PARTICLE:
      effect = readParticle(file, position);
      break;
    case Rw2dEffectType.ATTRACTOR:
      effect = readAttractor(file, position);
      break;
    case Rw2dEffectType.ENEX:
      effect = readEnEx(file, position);
      break;
    case Rw2dEffectType.ROADSIGN:
      effect = readRoadsign(file, position);
      break;
    case Rw2dEffectType.COVER_POINT:
      effect = readCoverPoint(file, position);
      break;
    case Rw2dEffectType.ESCALATOR:
      effect = readEscalator(file, position);
      break;
    default:
      effect = readGeneric(file, position, type, dataSize);
      break;
  }

  file.setPosition(dataStart + dataSize);
  return effect;
}

function readLight(
  file: RwFile,
  position: { x: number; y: number; z: number },
): Rw2dEffectLight {
  const color = {
    r: file.readUint8(),
    g: file.readUint8(),
    b: file.readUint8(),
    a: file.readUint8(),
  };
  const coronaFarClip = file.readFloat();
  const pointlightRange = file.readFloat();
  const coronaSize = file.readFloat();
  const shadowSize = file.readFloat();
  const coronaShowMode = file.readUint8();
  const coronaEnableReflection = file.readUint8() !== 0;
  const coronaFlareType = file.readUint8();
  const shadowColorMultiplier = file.readUint8();
  const flags1 = file.readUint8();
  const coronaTexName = file.readString(24);
  const shadowTexName = file.readString(24);
  const shadowZDistance = file.readUint8();
  const flags2 = file.readUint8();

  return {
    type: Rw2dEffectType.LIGHT,
    position,
    color,
    coronaFarClip,
    pointlightRange,
    coronaSize,
    shadowSize,
    coronaShowMode,
    coronaEnableReflection,
    coronaFlareType,
    shadowColorMultiplier,
    flags1,
    coronaTexName,
    shadowTexName,
    shadowZDistance,
    flags2,
  };
}

function readParticle(
  file: RwFile,
  position: { x: number; y: number; z: number },
): Rw2dEffectParticle {
  const effectName = file.readString(24).replace(/\0+$/, "");
  return { type: Rw2dEffectType.PARTICLE, position, effectName };
}

function readAttractor(
  file: RwFile,
  position: { x: number; y: number; z: number },
): Rw2dEffectAttractor {
  const queueDir = {
    x: file.readFloat(),
    y: file.readFloat(),
    z: file.readFloat(),
  };
  const useDir = {
    x: file.readFloat(),
    y: file.readFloat(),
    z: file.readFloat(),
  };
  const forwardDir = {
    x: file.readFloat(),
    y: file.readFloat(),
    z: file.readFloat(),
  };
  const attractorType = file.readInt8();
  const pedExistingProbability = file.readUint8();
  file.skip(1);
  const flags = file.readUint8();
  const scriptName = file.readString(8).replace(/\0+$/, "");

  return {
    type: Rw2dEffectType.ATTRACTOR,
    position,
    queueDir,
    useDir,
    forwardDir,
    attractorType,
    pedExistingProbability,
    flags,
    scriptName,
  };
}

function readEnEx(
  file: RwFile,
  position: { x: number; y: number; z: number },
): Rw2dEffectEnEx {
  const enterAngle = file.readFloat();
  const radiusX = file.readFloat();
  const radiusY = file.readFloat();
  const exitPos = {
    x: file.readFloat(),
    y: file.readFloat(),
    z: file.readFloat(),
  };
  const exitAngle = file.readFloat();
  const interiorId = file.readInt16();
  const flags1 = file.readUint8();
  const skyColor = file.readUint8();
  const interiorName = file.readString(8).replace(/\0+$/, "");
  const timeOn = file.readUint8();
  const timeOff = file.readUint8();
  const flags2 = file.readUint8();

  return {
    type: Rw2dEffectType.ENEX,
    position,
    enterAngle,
    radiusX,
    radiusY,
    exitPos,
    exitAngle,
    interiorId,
    flags1,
    skyColor,
    interiorName,
    timeOn,
    timeOff,
    flags2,
  };
}

function readRoadsign(
  file: RwFile,
  position: { x: number; y: number; z: number },
): Rw2dEffectRoadsign {
  const size = { x: file.readFloat(), y: file.readFloat() };
  const rotation = {
    x: file.readFloat(),
    y: file.readFloat(),
    z: file.readFloat(),
  };
  const flags = file.readUint16();
  file.skip(2);
  file.skip(8);

  return {
    type: Rw2dEffectType.ROADSIGN,
    position,
    size,
    rotation,
    flags,
    text: "",
  };
}

function readCoverPoint(
  file: RwFile,
  position: { x: number; y: number; z: number },
): Rw2dEffectCoverPoint {
  const coverDir = { x: file.readFloat(), y: file.readFloat() };
  const usage = file.readUint32();
  return { type: Rw2dEffectType.COVER_POINT, position, coverDir, usage };
}

function readEscalator(
  file: RwFile,
  position: { x: number; y: number; z: number },
): Rw2dEffectEscalator {
  const bottom = {
    x: file.readFloat(),
    y: file.readFloat(),
    z: file.readFloat(),
  };
  const top = { x: file.readFloat(), y: file.readFloat(), z: file.readFloat() };
  const end = { x: file.readFloat(), y: file.readFloat(), z: file.readFloat() };
  const direction = file.readUint8();

  return {
    type: Rw2dEffectType.ESCALATOR,
    position,
    bottom,
    top,
    end,
    direction,
  };
}

function readGeneric(
  file: RwFile,
  position: { x: number; y: number; z: number },
  type: Rw2dEffectType,
  dataSize: number,
): Rw2dEffectGeneric {
  const data = file.readBytes(dataSize);
  return { type: type as Rw2dEffectGeneric["type"], position, data };
}
