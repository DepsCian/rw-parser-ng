# Texture codecs

Bitmap, palette, and DXT decoders return RGBA bytes in a Uint8Array. TXD format dispatch lives in src/txd/bitmap-decoder.ts.

BC1, BC2, and BC3 consume complete 4x4 encoded blocks. Writes are clipped to the texture dimensions, including dimensions below four and partial blocks at right and bottom edges. Selectors advance for every encoded pixel, including clipped pixels. Aligned textures retain their interpolation and alpha behavior.
