import { readFile } from "node:fs/promises";
import { join } from "node:path";
import {
  DffParser,
  Rw2dEffectType,
  type Rw2dEffect,
  type Rw2dEffectLight,
} from "../../src/index";

describe("2dEffect parsing", () => {
  describe("lamppost1.dff", () => {
    let effects: Rw2dEffect[];

    beforeAll(async () => {
      const dff = new DffParser(
        await readFile(join(__dirname, "../assets/lamppost1.dff")),
      ).parse();
      effects = dff.geometryList!.geometries[0].effects2d!;
    });

    test("has 1 effect", () => {
      expect(effects).toHaveLength(1);
    });

    test("effect is LIGHT type", () => {
      expect(effects[0].type).toBe(Rw2dEffectType.LIGHT);
    });

    test("light color is orange", () => {
      const light = effects[0] as Rw2dEffectLight;
      expect(light.color.r).toBe(249);
      expect(light.color.g).toBe(145);
      expect(light.color.b).toBe(34);
      expect(light.color.a).toBe(200);
    });

    test("light position", () => {
      const light = effects[0] as Rw2dEffectLight;
      expect(light.position.x).toBeCloseTo(-0.435, 2);
      expect(light.position.z).toBeCloseTo(3.202, 2);
    });

    test("light properties", () => {
      const light = effects[0] as Rw2dEffectLight;
      expect(light.coronaFarClip).toBe(100);
      expect(light.pointlightRange).toBeCloseTo(12, 0);
      expect(light.coronaSize).toBeCloseTo(2.5, 1);
      expect(light.shadowSize).toBe(8);
      expect(light.coronaEnableReflection).toBe(true);
    });

    test("light textures", () => {
      const light = effects[0] as Rw2dEffectLight;
      expect(light.coronaTexName).toBe("coronastar");
      expect(light.shadowTexName).toBe("shad_exp");
    });
  });

  describe("trafficlight1.dff", () => {
    let effects: Rw2dEffect[];

    beforeAll(async () => {
      const dff = new DffParser(
        await readFile(join(__dirname, "../assets/trafficlight1.dff")),
      ).parse();
      effects = dff.geometryList!.geometries[0].effects2d!;
    });

    test("has 6 effects", () => {
      expect(effects).toHaveLength(6);
    });

    test("all effects are LIGHT type", () => {
      effects.forEach((e) => expect(e.type).toBe(Rw2dEffectType.LIGHT));
    });

    test("has yellow light", () => {
      const yellow = effects[0] as Rw2dEffectLight;
      expect(yellow.color.r).toBe(255);
      expect(yellow.color.g).toBe(210);
      expect(yellow.color.b).toBe(52);
    });

    test("has green light", () => {
      const green = effects[1] as Rw2dEffectLight;
      expect(green.color.r).toBe(0);
      expect(green.color.g).toBe(255);
      expect(green.color.b).toBe(0);
    });

    test("has red light", () => {
      const red = effects[2] as Rw2dEffectLight;
      expect(red.color.r).toBe(255);
      expect(red.color.g).toBe(0);
      expect(red.color.b).toBe(0);
    });
  });
});
