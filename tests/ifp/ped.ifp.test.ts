import { readFileSync } from "fs";
import { IfpParser, IfpVersion } from "../../src";

describe("IFP Parser - ped.ifp", () => {
  const buffer = readFileSync("./tests/assets/ped.ifp");
  const result = new IfpParser(buffer).parse();

  test("version", () => {
    expect(result.version).toBe(IfpVersion.ANP3);
  });

  test("name", () => {
    expect(result.name).toBe("ped");
  });

  test("animations count", () => {
    expect(result.animations.length).toBe(7);
  });

  test("first animation - name", () => {
    expect(result.animations[0].name).toBe("bomber");
  });

  test("first animation - bones count", () => {
    expect(result.animations[0].bones.length).toBe(32);
  });

  test("first animation - Root bone properties", () => {
    const root = result.animations[0].bones[0];
    expect(root.name).toBe("Root");
    expect(root.keyframeType).toBe("KR00");
    expect(root.useBoneId).toBe(true);
    expect(root.boneId).toBe(0);
  });

  test("first animation - Root bone keyframes count", () => {
    const root = result.animations[0].bones[0];
    expect(root.keyframes.length).toBe(2);
  });

  test("first animation - Root bone first keyframe", () => {
    const kf = result.animations[0].bones[0].keyframes[0];
    expect(kf.time).toBe(0);
    expect(kf.position).toStrictEqual({ x: 0, y: 0, z: 0 });
    expect(kf.rotation.w).toBeCloseTo(0.8244, 3);
    expect(kf.rotation.x).toBeCloseTo(0.0046, 3);
    expect(kf.rotation.y).toBeCloseTo(0.0053, 3);
    expect(kf.rotation.z).toBeCloseTo(0.5656, 3);
    expect(kf.scale).toStrictEqual({ x: 1, y: 1, z: 1 });
  });

  test("first animation - Root bone second keyframe", () => {
    const kf = result.animations[0].bones[0].keyframes[1];
    expect(kf.time).toBe(36);
    expect(kf.rotation.w).toBeCloseTo(0.8244, 3);
  });

  test("first animation - Pelvis bone properties", () => {
    const pelvis = result.animations[0].bones[1];
    expect(pelvis.name).toBe(" Pelvis");
    expect(pelvis.boneId).toBe(1);
  });

  test("first animation - Pelvis bone rotation", () => {
    const kf = result.animations[0].bones[1].keyframes[0];
    expect(kf.rotation.w).toBeCloseTo(0.4853, 3);
    expect(kf.rotation.x).toBeCloseTo(-0.5139, 3);
    expect(kf.rotation.y).toBeCloseTo(-0.5139, 3);
    expect(kf.rotation.z).toBeCloseTo(-0.4853, 3);
  });
});
