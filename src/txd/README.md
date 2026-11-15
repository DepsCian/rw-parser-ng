# TXD parsing

`TxdParser` reads texture dictionaries and native texture metadata, then delegates bitmap selection to `bitmap-decoder.ts`. Pixel decoding is shared through `src/codecs`. The current parser decodes only the first mip level.

Unknown compression identifiers and raster formats throw the existing public `RwParseError` with the offending identifier. The error propagates from bitmap selection through `TxdParser.parse()`; callers must handle unsupported formats rather than treating an empty bitmap as successful decoding. Supported formats retain their existing dispatch and pixel output.
