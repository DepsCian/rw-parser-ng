import { readFileSync } from "fs";
import { IfpParser } from "../../src";
import { IfpVersion } from "../../src/renderware/ifp/IfpData";

describe("IFP Parser - ped.ifp", () => {
  const buffer = readFileSync("./tests/assets/ped.ifp");
  const ifp = new IfpParser(buffer);
  const result = ifp.parse();

  test("version", () => {
    expect(result.version).toBe(IfpVersion.ANP3);
  });

  test("name", () => {
    expect(result.name).toBe("ped");
  });

  test("animations count", () => {
    expect(result.animations.length).toBeGreaterThan(0);
  });

  test("first animation name", () => {
    expect(result.animations[0].name).toBe("bomber");
  });

  test("first animation bones", () => {
    const bones = result.animations[0].bones;
    expect(bones.length).toBeGreaterThan(0);
    expect(bones[0].name).toBe("Root");
    expect(bones[0].boneId).toBe(0);
  });

  test("keyframes structure", () => {
    const keyframes = result.animations[0].bones[0].keyframes;
    expect(keyframes.length).toBeGreaterThan(0);
    expect(keyframes[0]).toHaveProperty("time");
    expect(keyframes[0]).toHaveProperty("position");
    expect(keyframes[0]).toHaveProperty("rotation");
    expect(keyframes[0]).toHaveProperty("scale");
  });

  test("first keyframe values", () => {
    const kf = result.animations[0].bones[0].keyframes[0];
    expect(kf.time).toBe(0);
    expect(kf.rotation.w).toBeCloseTo(0.824, 2);
    expect(kf.rotation.z).toBeCloseTo(0.565, 2);
  });
});
