set -euo pipefail
package_directory=$(mktemp -d)
trap 'rm -rf "$package_directory"' EXIT
npm pack --ignore-scripts --pack-destination "$package_directory" --json > "$package_directory/pack.json"
package_file=$(node -p 'Object.values(JSON.parse(require("node:fs").readFileSync(process.argv[1], "utf8")))[0].filename' "$package_directory/pack.json")
mkdir "$package_directory/unpacked"
tar -xzf "$package_directory/$package_file" -C "$package_directory/unpacked"
node -e 'const fs = require("node:fs"); const path = require("node:path"); for (const file of ["lib/index.js", "lib/index.d.ts", "LICENSE", "CREDITS.md", "MIGRATION.md"]) fs.accessSync(path.join(process.argv[1], "package", file));' "$package_directory/unpacked"
npm install --prefix "$package_directory/consumer" --ignore-scripts --no-audit --no-fund "$package_directory/$package_file"
cd "$package_directory/consumer"
node -e 'const assert = require("node:assert/strict"); const kit = require("rwkit"); for (const name of ["DffParser", "TxdParser", "IfpParser", "parseFxpContent"]) assert.equal(typeof kit[name], "function");'
node --input-type=module -e 'import assert from "node:assert/strict"; import { DffParser, TxdParser, IfpParser, parseFxpContent } from "rwkit"; for (const value of [DffParser, TxdParser, IfpParser, parseFxpContent]) assert.equal(typeof value, "function");'
