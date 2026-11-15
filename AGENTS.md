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

For the initial npm bootstrap, a valid login does not satisfy publishing 2FA. Prefer npm stage publish followed by stage approval. Staging is asynchronous: inspect its status and wait for validation before approval. Never request passwords, tokens, or authentication codes in chat.
