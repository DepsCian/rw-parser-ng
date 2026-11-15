# TXD parsing

`TxdParser.parse()` and the public texture readers retain eager first-mipmap decoding and `number[][]` output. Pixel bytes are RGBA. Format selection is shared with explicit decoding.

`parseStructure({ copyData?: boolean })` returns `RwTxdStructure`. Each texture retains metadata, exact `compressionFlags`, palette bytes, and all encoded mipmaps. A mipmap contains `width`, `height`, and `data: Uint8Array`. Dimensions halve with floor rounding, clamped to one. No pixels are decoded during structure parsing.

By default palette and mip data share the input buffer. Treat that buffer as immutable while using results; retaining a view may retain the whole allocation. Views survive parser disposal. Set `copyData: true` for independent byte storage.

`decodeTextureMipmap(texture, level = 0)` returns a fresh RGBA Uint8Array and does not cache results or mutate the structure. Invalid indices throw RangeError. Unsupported formats, invalid dimensions, and truncated encoded payloads throw RwParseError. Structure parsing retains unknown formats for metadata inspection but rejects truncated structures and payloads crossing native section boundaries.

Compressed blocks include padding to 4x4 boundaries; decoded output is clipped to the actual mip dimensions. Uncompressed formats retain existing codec layout, including four-byte storage for RASTER_888. Workers and asynchronous decoding are not provided.
