# RenderWare Binary Stream Parser NG

[![npm](https://img.shields.io/npm/v/rw-parser-ng.svg)](https://www.npmjs.com/package/rw-parser-ng)
[![CI](https://github.com/DepsCian/rw-parser-ng/actions/workflows/test.yml/badge.svg)](https://github.com/DepsCian/rw-parser-ng/actions/workflows/test.yml)
[![License: GPL-3.0](https://img.shields.io/npm/l/rw-parser-ng.svg)](https://github.com/DepsCian/rw-parser-ng/blob/master/LICENSE)

A TypeScript library for parsing RenderWare binary stream files used in GTA III, Vice City, and San Andreas.

This is a maintained fork of [rw-parser](https://github.com/Timic3/rw-parser) by Timic3.

## Supported Formats

| Format | Extension | Description |
|--------|-----------|-------------|
| DFF | `.dff` | 3D model geometry, materials, frames, skinning data |
| TXD | `.txd` | Texture dictionaries with compressed/paletted textures |
| IFP | `.ifp` | Skeletal animations (ANP3, ANPK formats) |
| FXP | `.fxp` | Particle effect systems (GTA SA) |

## Supported RenderWare Versions

| Version | Build | Game |
|---------|-------|------|
| 3.1.0.0 | 200704 | GTA III (PS2) |
| 3.2.0.0 | 204800 | GTA III (PC) |
| 3.3.0.2 | 208898 | GTA III (PC), Vice City (PS2) |
| 3.4.0.3 | 212995 | Vice City (PC) |
| 3.4.0.5 | 212997 | GTA III (PS2), Vice City (Android/PC) |
| 3.5.0.0 | 217088 | GTA III/VC (Xbox) |
| 3.6.0.3 | 221187 | San Andreas |

## Installation

```sh
bun add rw-parser-ng
```

```sh
npm install rw-parser-ng
```

## Usage

### DFF (3D Models)

```typescript
import { DffParser } from 'rw-parser-ng';
import { readFileSync } from 'node:fs';

const buffer = readFileSync('model.dff');
const parser = new DffParser(buffer);
const dff = parser.parse();

// Access parsed data
console.log(dff.version);                          // "RenderWare 3.6.0.3 (SA)"
console.log(dff.modelType);                        // DffModelType.SKIN | VEHICLE | GENERIC
console.log(dff.geometryList.geometries.length);   // Number of geometries
console.log(dff.frameList.frames.length);          // Number of frames
console.log(dff.dummies);                          // Node names
console.log(dff.animNodes);                        // Animation hierarchy
```

### TXD (Textures)

```typescript
import { TxdParser } from 'rw-parser-ng';
import { readFileSync } from 'node:fs';

const buffer = readFileSync('textures.txd');
const parser = new TxdParser(buffer);
const txd = parser.parse();

for (const texture of txd.textureDictionary.textureNatives) {
    console.log(texture.textureName);    // Texture name
    console.log(texture.width, texture.height);
    console.log(texture.d3dFormat);      // DXT1, DXT3, DXT5, etc.
    console.log(texture.mipmaps[0]);     // Decoded BGRA pixel data
}
```

### IFP (Animations)

```typescript
import { IfpParser } from 'rw-parser-ng';
import { readFileSync } from 'node:fs';

const buffer = readFileSync('animation.ifp');
const parser = new IfpParser(buffer);
const ifp = parser.parse();

console.log(ifp.name);                   // Animation pack name
console.log(ifp.version);                // IfpVersion.ANP3 | ANPK

for (const anim of ifp.animations) {
    console.log(anim.name);              // Animation name
    for (const bone of anim.bones) {
        console.log(bone.name, bone.keyframes.length);
    }
}
```

### FXP (Particle Effects)

```typescript
import { parseFxpFile, parseFxpContent } from 'rw-parser-ng';

// From file path
const project = parseFxpFile('effects.fxp');

// From string content
const content = readFileSync('effects.fxp', 'utf-8');
const project = parseFxpContent(content);

for (const [name, system] of project.systems) {
    console.log(name, system.length);    // System name and duration
    for (const emitter of system.prims) {
        console.log(emitter.name, emitter.textures);
    }
}
```

### Browser Usage

The library works in browsers with a Buffer polyfill (provided by bundlers like Webpack, Vite, or esbuild):

```typescript
import { DffParser } from 'rw-parser-ng';

const response = await fetch('model.dff');
const arrayBuffer = await response.arrayBuffer();
const buffer = Buffer.from(arrayBuffer);

const parser = new DffParser(buffer);
const dff = parser.parse();
```

## API Reference

### DFF Parser

The `DffParser` class parses RenderWare Clump structures:

```typescript
interface RwDff {
    modelType: DffModelType;           // GENERIC, SKIN, or VEHICLE
    version: string;                   // Human-readable version
    versionNumber: number;             // Numeric version
    geometryList: RwGeometryList;      // Meshes with vertices, normals, UVs
    frameList: RwFrameList;            // Bone/node hierarchy
    atomics: number[];                 // Geometry-to-frame mapping
    dummies: string[];                 // Node names
    animNodes: RwAnimNode[];           // Animation node data
}
```

Geometry data includes:
- Vertex positions and normals
- Texture coordinates (multiple UV sets)
- Vertex colors
- Triangle indices
- Materials with textures
- BinMesh data for rendering
- Skin weights and bone matrices

### TXD Parser

The `TxdParser` class parses texture dictionaries:

```typescript
interface RwTextureNative {
    platformId: number;                // D3D8 (0x8) or D3D9 (0x9)
    textureName: string;
    maskName: string;
    width: number;
    height: number;
    depth: number;                     // Bits per pixel
    d3dFormat: string;                 // DXT1, DXT3, DXT5, etc.
    mipmaps: number[][];               // Decoded BGRA data
    alpha: boolean;
    compressed: boolean;
}
```

Supported texture formats:
- DXT1, DXT2, DXT3, DXT4, DXT5 (S3TC compression)
- Paletted 4-bit and 8-bit
- BGRA 8888, 888, 565, 555, 1555, 4444
- Luminance 8-bit, A8L8

### IFP Parser

The `IfpParser` class parses animation files:

```typescript
interface RwIfp {
    version: IfpVersion;               // ANP3 or ANPK
    name: string;
    animations: RwIfpAnimation[];
}

interface RwIfpKeyframe {
    time: number;
    position: RwVector3;
    rotation: RwQuaternion;
    scale: RwVector3;
}
```

### FXP Parser

The FXP parser handles GTA San Andreas particle effect definitions:

```typescript
interface FxProject {
    systems: Map<string, FxSystemBP>;
}

interface FxSystemBP {
    name: string;
    length: number;
    playMode: number;
    cullDist: number;
    boundingSphere: FxBoundingSphere;
    prims: FxEmitterBP[];
}
```

Supported effect info types: emrate, emsize, emspeed, emdir, emangle, emlife, empos, emweather, emrotation, noise, force, friction, attractpt, attractline, groundcollide, wind, jitter, rotspeed, float, underwater, colour, size, spriterect, heathaze, trail, flat, dir, animtex, colourrange, selflit, colourbright, smoke.

## Project Structure

```
src/
├── core/           # Base classes: ByteStream, RwFile, section definitions
├── common/         # Shared types: vectors, matrices, colors, quaternions
├── codecs/         # Texture decoders: DXT, palette, raster formats
├── dff/            # DFF parser and geometry readers
├── txd/            # TXD parser and bitmap decoder
├── ifp/            # IFP parser (ANP3, ANPK readers)
└── fxp/            # FXP parser and info type handlers
```

## Development

Requirements: [Bun](https://bun.sh/) runtime

```sh
# Install dependencies
bun install

# Build
bun run build

# Watch mode
bun run dev

# Run tests
bun test

# Lint
bun run lint

# Format
bun run format
```

## Contributing

Contributions are welcome. Please open an issue or submit a pull request.

When contributing:
1. Fork the repository
2. Create a feature branch
3. Ensure tests pass with `bun test`
4. Ensure code passes lint with `bun run lint`
5. Submit a pull request

## Credits

- [Timic3](https://github.com/Timic3) - Original rw-parser author
- [MegadreamsBE](https://github.com/MegadreamsBE) - Contributor
- [AlterSDB](https://github.com/AlterSDB) - Contributor
- [librw](https://github.com/aap/librw) - RenderWare reference implementation
- [gta-reversed](https://github.com/gta-reversed/gta-reversed-modern) - GTA SA reverse engineering

## License

GPL-3.0 - See [LICENSE](LICENSE) for details.