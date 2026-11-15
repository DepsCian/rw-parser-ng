# Project guidance

This is a Bun-based TypeScript library for RenderWare assets. The package entry point is `src/index.ts`; format modules expose parsers and result types through their own index files.

- `src/core` owns the byte cursor, section headers, versions, and shared parse errors.
- `src/dff`, `src/txd`, `src/ifp`, and `src/fxp` own format-specific parsing. Texture codecs live in `src/codecs`.
- Use `bun run build`, `bun test`, and `bun run lint` for verification. Existing tests use real assets in `tests/assets`.
- Keep new and refactored source files under 300 lines. Reuse existing readers and codecs; avoid runtime dependencies and explicit `any` types.
- For binary stream changes, validate ranges before advancing the cursor and preserve its position on failure.
- For counted text blocks, reject missing entries without scanning into the next block or looping past the input.
- Report unsupported texture formats with the existing `RwParseError` type rather than returning an empty bitmap.
- Preserve parse error prototypes when compiling to ES5 so consumers can use `instanceof`.
- Document module behavior in its README. Update this file when architecture or cross-module conventions change.
- Do not add unit tests unless requested. Verify fixes with the existing suite and targeted runtime checks.

## Repository and releases

The repository is DepsCian/RWKit and the npm package is rwkit. Keep upstream attribution in CREDITS.md and ship it with LICENSE. MIGRATION.md describes the legacy package transition; never rewrite history or remove legacy tags.

Release Please owns the release manifest, package version, and changelog after the initial 1.0.0 release. Use rwkit-vX.Y.Z tags. The GitHub App creates release PRs; maintainers merge them manually. Release and npm automation are separately gated by repository variables. See docs/releases.md before changing workflows, credentials, or publishing.

CI requires build and Validate PR title. Preserve these check names because master protection depends on them. Pin Actions to full commit SHAs. Package smoke checks live in .github/scripts; do not add unit tests unless requested.

Performance workloads live in benchmarks/ and run against compiled lib output with `bun run build` followed by `bun run bench`. CI reports timings without regression thresholds. Always distinguish input size from consumed bytes.

ByteStream.readView returns shared input storage; read/readBytes retain copy semantics. Views outlive disposal and can retain the backing buffer.

DXT decoders clip partial block writes but consume all encoded selectors. Preserve this behavior for small and non-multiple-of-four mip dimensions. Codec output is RGBA.

TXD parseStructure retains encoded mip levels and palettes with shared views by default; copyData opts into copies. decodeTextureMipmap derives fresh RGBA pixels without caching. Legacy parse/readers still decode only the first mip to number arrays. Native payloads must remain inside their declared section.
