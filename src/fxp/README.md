# FXP parsing

`parseFxpContent` parses text into systems keyed by name; `parseFxpFile` reads UTF-8 content through Node's filesystem. The parser owns line traversal, and `info-parser.ts` maps effect markers and builds typed interpolation data.

`NUM_PRIMS` must be a nonnegative safe integer. Each declared entry must begin with `FX_PRIM_EMITTER_DATA:` after blank lines. A missing emitter or invalid count throws `RwParseError`; missing entries cannot consume a following system or loop past end of input. Other field parsing retains its existing behavior.
