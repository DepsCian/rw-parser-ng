import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { DffParser, type RwBreakable } from "../../src/index";

describe("Breakable parsing", () => {
  describe("fire_hydrant.dff", () => {
    let breakable: RwBreakable;

    beforeAll(async () => {
      const dff = new DffParser(
        await readFile(join(__dirname, "../assets/fire_hydrant.dff")),
      ).parse();
      breakable = dff.geometryList!.geometries[0].breakable!;
    });

    test("has breakable data", () => {
      expect(breakable).toBeDefined();
    });

    test("has correct vertex count", () => {
      expect(breakable.vertices).toHaveLength(434);
    });

    test("has correct triangle count", () => {
      expect(breakable.triangles).toHaveLength(278);
    });

    test("has correct material count", () => {
      expect(breakable.materials).toHaveLength(18);
    });

    test("positionRule is 1", () => {
      expect(breakable.positionRule).toBe(1);
    });

    test("material has correct texture name", () => {
      expect(breakable.materials[0].textureName).toBe("firehydrant_yell");
    });

    test("texCoords match vertex count", () => {
      expect(breakable.texCoords).toHaveLength(434);
    });

    test("colors match vertex count", () => {
      expect(breakable.colors).toHaveLength(434);
    });

    test("triangleMaterialIndices match triangle count", () => {
      expect(breakable.triangleMaterialIndices).toHaveLength(278);
    });
  });
});
