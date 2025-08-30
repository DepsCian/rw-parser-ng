# RenderWare Binary Stream Parser NG

[![npm](https://img.shields.io/npm/v/rw-parser-ng.svg)](https://www.npmjs.com/package/rw-parser-ng)
[![NPM](https://img.shields.io/npm/l/rw-parser-ng.svg)](https://github.com/DepsCian/rw-parser-ng/blob/master/LICENSE)

Parses RenderWare files (`.dff`, `.txd`, `.ifp`) into a usable format.

This is a fork of the original [rw-parser](https://github.com/Timic3/rw-parser) by Timic3, which is no longer active maintained. This version aims to continue development, fix bugs, and add new features.

## Features

*   **DFF (Model) Parsing:** Extracts geometry, materials, frames, and skinning data.
*   **TXD (Texture Dictionary) Parsing:** Extracts texture information, including name, resolution and pixel data.
*   **IFP (Animation) Parsing:** Extracts animation data, including bone names, keyframes, and timings.
*   **Cross-Platform:** Works in both Node.js and modern web browsers.
*   **TypeScript Support:** Fully typed for a better development experience.

## Installation

Install `rw-parser-ng` using pnpm:

```bash
pnpm install --save rw-parser-ng
```

## Usage

### ES6 Module

```javascript
import { DffParser, TxdParser, IfpParser } from 'rw-parser-ng';
import { readFileSync } from 'fs';

// DFF
const dffBuffer = readFileSync('path/to/your/model.dff');
const dffParser = new DffParser(dffBuffer);
const dffData = dffParser.parse();
console.log(dffData);

// TXD
const txdBuffer = readFileSync('path/to/your/textures.txd');
const txdParser = new TxdParser(txdBuffer);
const txdData = txdParser.parse();
console.log(txdData);

// IFP
const ifpBuffer = readFileSync('path/to/your/animation.ifp');
const ifpParser = new IfpParser(ifpBuffer);
const ifpData = ifpParser.parse();
console.log(ifpData);
```

### Browser Usage

This library can also be used in the browser. You will need a bundler like Webpack or Rollup to handle the Node.js `Buffer` dependency.

```javascript
import { DffParser } from 'rw-parser-ng';

async function parseDffFromUrl(url) {
    const response = await fetch(url);
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer); // Requires Buffer polyfill

    const dffParser = new DffParser(buffer);
    const dffData = dffParser.parse();
    console.log(dffData);
}

parseDffFromUrl('path/to/your/model.dff');
```

## Development

1.  Clone the repository: `git clone https://github.com/DepsCian/rw-parser-ng.git`
2.  Install dependencies: `pnpm install`
3.  Build the project: `pnpm run build`
4.  Run tests: `pnpm test`

To watch for changes during development, use `pnpm run dev`.

## Contributing

Contributions are welcome! Please feel free to open an issue or submit a pull request.

## License

This project is licensed under the GPL-3.0 License. See the [LICENSE](LICENSE) file for details.
