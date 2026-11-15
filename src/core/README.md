# Binary stream core

`ByteStream` owns a Buffer and its cursor. `RwFile` adds RenderWare section headers; shared errors and version utilities are exported through `index.ts`.

All read sizes, skip distances, and seek positions must be nonnegative safe integers within the buffer. Invalid operations throw `RangeError` before changing the cursor. `setPosition` supports backward seeks; `skip` only moves forward. Seeking to the end and zero-length reads at the end are valid. `readBytes` returns a copy. `dispose` resets the stream to an empty buffer at position zero.

The bounds apply to the complete buffer. Format readers remain responsible for enforcing individual section boundaries.

`readView(size)` returns shared bytes without copying. Mutating the input changes the view and vice versa. A retained view can retain the entire backing allocation. Views remain valid after `dispose()`; disposal only releases the stream's reference. `read()` and `readBytes()` continue to return independent copies.
