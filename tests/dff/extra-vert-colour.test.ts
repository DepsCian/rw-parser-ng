import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { DffParser } from "../../src/index";

describe("ExtraVertColour parsing", () => {
  describe("vgs_roadsign1.dff", () => {
    let extraVertColour: { r: number; g: number; b: number; a: number }[];

    beforeAll(async () => {
      const dff = new DffParser(
        await readFile(join(__dirname, "../assets/vgs_roadsign1.dff")),
      ).parse();
      extraVertColour = dff.geometryList!.geometries[0].extraVertColour!;
    });

    test("has 214 vertex colors", () => {
      expect(extraVertColour).toHaveLength(214);
    });

    test("colors have valid RGBA values", () => {
      extraVertColour.forEach((color) => {
        expect(color.r).toBeGreaterThanOrEqual(0);
        expect(color.r).toBeLessThanOrEqual(255);
        expect(color.g).toBeGreaterThanOrEqual(0);
        expect(color.g).toBeLessThanOrEqual(255);
        expect(color.b).toBeGreaterThanOrEqual(0);
        expect(color.b).toBeLessThanOrEqual(255);
        expect(color.a).toBeGreaterThanOrEqual(0);
        expect(color.a).toBeLessThanOrEqual(255);
      });
    });
  });
});
