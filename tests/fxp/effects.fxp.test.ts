import { readFileSync } from "fs";
import { parseFxpContent } from "../../src";

describe("FXP Parser - effects.fxp", () => {
  const content = readFileSync("./tests/assets/effects.fxp", "utf-8");
  const result = parseFxpContent(content);

  test("systems count", () => {
    expect(result.systems.size).toBe(237);
  });

  test("prt_blood - system properties", () => {
    const system = result.systems.get("prt_blood")!;
    expect(system.name).toBe("prt_blood");
    expect(system.filename).toBe(
      "X:\\SA\\FxTools\\Data\\effects\\gta_pc\\particles/prt_blood.fxs",
    );
    expect(system.length).toBe(1);
    expect(system.playMode).toBe(2);
    expect(system.cullDist).toBe(50);
  });

  test("prt_blood - bounding sphere", () => {
    const bs = result.systems.get("prt_blood")!.boundingSphere!;
    expect(bs.x).toBe(0);
    expect(bs.y).toBe(0);
    expect(bs.z).toBe(0);
    expect(bs.radius).toBe(0);
  });

  test("prt_blood - prims count and name", () => {
    const prims = result.systems.get("prt_blood")!.prims;
    expect(prims.length).toBe(1);
    expect(prims[0].name).toBe("ParticleEmitter");
  });

  test("prt_blood - prim matrix", () => {
    const matrix = result.systems.get("prt_blood")!.prims[0].matrix;
    expect(matrix.right).toStrictEqual({ x: 1, y: 0, z: 0 });
    expect(matrix.up).toStrictEqual({ x: 0, y: 1, z: 0 });
    expect(matrix.at).toStrictEqual({ x: 0, y: 0, z: 1 });
    expect(matrix.pos).toStrictEqual({ x: 0, y: 0, z: 0 });
  });

  test("prt_blood - textures", () => {
    const textures = result.systems.get("prt_blood")!.prims[0].textures;
    expect(textures[0]).toBe("sphere");
    expect(textures[1]).toBeNull();
    expect(textures[2]).toBeNull();
    expect(textures[3]).toBeNull();
  });

  test("prt_blood - blend settings", () => {
    const prim = result.systems.get("prt_blood")!.prims[0];
    expect(prim.alphaOn).toBe(true);
    expect(prim.srcBlendId).toBe(4);
    expect(prim.dstBlendId).toBe(5);
  });

  test("prt_blood - LOD settings", () => {
    const prim = result.systems.get("prt_blood")!.prims[0];
    expect(prim.lodStart).toBe(30);
    expect(prim.lodEnd).toBe(50);
  });

  test("prt_blood - infos count", () => {
    const infos = result.systems.get("prt_blood")!.prims[0].infos;
    expect(infos.length).toBe(10);
  });

  test("prt_blood - emspeed info", () => {
    const infos = result.systems.get("prt_blood")!.prims[0].infos;
    const emspeed = infos.find((i) => i.type === "emspeed")!;
    expect(emspeed.type).toBe("emspeed");
    if (emspeed.type === "emspeed") {
      expect(emspeed.speed.looped).toBe(false);
      expect(emspeed.speed.keys[0].time).toBe(0);
      expect(emspeed.speed.keys[0].value).toBe(2);
      expect(emspeed.bias.keys[0].value).toBe(0.5);
    }
  });

  test("prt_blood - emdir info", () => {
    const infos = result.systems.get("prt_blood")!.prims[0].infos;
    const emdir = infos.find((i) => i.type === "emdir")!;
    if (emdir.type === "emdir") {
      expect(emdir.dirX.keys[0].value).toBe(0);
      expect(emdir.dirY.keys[0].value).toBe(0);
      expect(emdir.dirZ.keys[0].value).toBe(1);
    }
  });

  test("prt_blood - emlife info", () => {
    const infos = result.systems.get("prt_blood")!.prims[0].infos;
    const emlife = infos.find((i) => i.type === "emlife")!;
    if (emlife.type === "emlife") {
      expect(emlife.life.keys[0].value).toBe(0.7);
      expect(emlife.bias.keys[0].value).toBe(0.2);
    }
  });

  test("prt_blood - emrate info", () => {
    const infos = result.systems.get("prt_blood")!.prims[0].infos;
    const emrate = infos.find((i) => i.type === "emrate")!;
    if (emrate.type === "emrate") {
      expect(emrate.rate.keys[0].value).toBe(150);
    }
  });

  test("prt_blood - emangle info", () => {
    const infos = result.systems.get("prt_blood")!.prims[0].infos;
    const emangle = infos.find((i) => i.type === "emangle")!;
    if (emangle.type === "emangle") {
      expect(emangle.min.keys[0].value).toBe(0);
      expect(emangle.max.keys[0].value).toBe(30);
    }
  });

  test("prt_blood - force info", () => {
    const infos = result.systems.get("prt_blood")!.prims[0].infos;
    const force = infos.find((i) => i.type === "force")!;
    if (force.type === "force") {
      expect(force.forceX.keys[0].value).toBe(0);
      expect(force.forceY.keys[0].value).toBe(0);
      expect(force.forceZ.keys[0].value).toBe(-10);
    }
  });

  test("prt_blood - size info with multiple keys", () => {
    const infos = result.systems.get("prt_blood")!.prims[0].infos;
    const size = infos.find((i) => i.type === "size")!;
    if (size.type === "size") {
      expect(size.sizeX.keys.length).toBe(2);
      expect(size.sizeX.keys[0]).toStrictEqual({ time: 0, value: 0.1 });
      expect(size.sizeX.keys[1]).toStrictEqual({ time: 1, value: 0.1 });
    }
  });

  test("prt_blood - colour info with alpha fade", () => {
    const infos = result.systems.get("prt_blood")!.prims[0].infos;
    const colour = infos.find((i) => i.type === "colour")!;
    if (colour.type === "colour") {
      expect(colour.red.keys[0].value).toBe(255);
      expect(colour.green.keys[0].value).toBe(255);
      expect(colour.blue.keys[0].value).toBe(255);
      expect(colour.alpha.keys[0].value).toBe(255);
      expect(colour.alpha.keys[1].value).toBe(0);
    }
  });

  test("prt_blood - spriterect info with interpolation", () => {
    const infos = result.systems.get("prt_blood")!.prims[0].infos;
    const spriterect = infos.find((i) => i.type === "spriterect")!;
    if (spriterect.type === "spriterect") {
      expect(spriterect.interps.length).toBe(4);
      expect(spriterect.interps[0].keys[0]).toStrictEqual({
        time: 0,
        value: 1,
      });
      expect(spriterect.interps[0].keys[1]).toStrictEqual({
        time: 1,
        value: 0.5,
      });
    }
  });
});
