export class ByteStream {
  private _cursor = 0;
  private _stream: Buffer;

  constructor(stream: Buffer) {
    this._stream = stream;
  }

  public readUint8(): number {
    this._validateRange(this._cursor, 1);
    const value = this._stream.readUInt8(this._cursor);
    this._cursor++;
    return value;
  }

  public readUint16(): number {
    this._validateRange(this._cursor, 2);
    const val = this._stream.readUInt16LE(this._cursor);
    this._cursor += 2;
    return val;
  }

  public readUint32(): number {
    this._validateRange(this._cursor, 4);
    const val = this._stream.readUInt32LE(this._cursor);
    this._cursor += 4;
    return val;
  }

  public readInt16(): number {
    this._validateRange(this._cursor, 2);
    const val = this._stream.readInt16LE(this._cursor);
    this._cursor += 2;
    return val;
  }

  public readInt8(): number {
    this._validateRange(this._cursor, 1);
    const value = this._stream.readInt8(this._cursor);
    this._cursor++;
    return value;
  }

  public readInt32(): number {
    this._validateRange(this._cursor, 4);
    const val = this._stream.readInt32LE(this._cursor);
    this._cursor += 4;
    return val;
  }

  public readFloat(): number {
    this._validateRange(this._cursor, 4);
    const val = this._stream.readFloatLE(this._cursor);
    this._cursor += 4;
    return val;
  }

  public readString(size: number): string {
    this._validateRange(this._cursor, size);
    const str = this._stream.toString("ascii", this._cursor, this._cursor + size);
    this._cursor += size;
    return str.split(/\0/g).shift() || "";
  }

  public readBytes(size: number): Uint8Array {
    this._validateRange(this._cursor, size);
    const data = this._stream.subarray(this._cursor, this._cursor + size);
    this._cursor += size;
    return new Uint8Array(data);
  }

  public read(size: number): Uint8Array {
    return this.readBytes(size);
  }

  public getSize(): number {
    return this._stream.byteLength;
  }

  public getPosition(): number {
    return this._cursor;
  }

  public setPosition(position: number): void {
    this._validateRange(position, 0);
    this._cursor = position;
  }

  public skip(size: number): void {
    this._validateRange(this._cursor, size);
    this._cursor += size;
  }

  public dispose(): void {
    this._stream = Buffer.alloc(0);
    this._cursor = 0;
  }

  private _validateRange(position: number, size: number): void {
    if (
      !Number.isSafeInteger(position) ||
      !Number.isSafeInteger(size) ||
      position < 0 ||
      size < 0 ||
      position > this.getSize() ||
      size > this.getSize() - position
    ) {
      throw new RangeError(
        `Invalid byte stream range: offset ${position}, size ${size}, buffer length ${this.getSize()}`,
      );
    }
  }
}
