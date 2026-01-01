export class ByteStream {
  private _cursor = 0;
  private _stream: Buffer;

  constructor(stream: Buffer) {
    this._stream = stream;
  }

  public readUint8(): number {
    return this._stream.readUInt8(this._cursor++);
  }

  public readUint16(): number {
    const val = this._stream.readUInt16LE(this._cursor);
    this._cursor += 2;
    return val;
  }

  public readUint32(): number {
    const val = this._stream.readUInt32LE(this._cursor);
    this._cursor += 4;
    return val;
  }

  public readInt16(): number {
    const val = this._stream.readInt16LE(this._cursor);
    this._cursor += 2;
    return val;
  }

  public readInt32(): number {
    const val = this._stream.readInt32LE(this._cursor);
    this._cursor += 4;
    return val;
  }

  public readFloat(): number {
    const val = this._stream.readFloatLE(this._cursor);
    this._cursor += 4;
    return val;
  }

  public readString(size: number): string {
    const str = this._stream.toString("ascii", this._cursor, this._cursor + size);
    this._cursor += size;
    return str.split(/\0/g).shift() || "";
  }

  public read(size: number): Uint8Array {
    const data = new Uint8Array(size);
    for (let i = 0; i < size; i++) data[i] = this.readUint8();
    return data;
  }

  public getSize(): number {
    return this._stream.byteLength;
  }

  public getPosition(): number {
    return this._cursor;
  }

  public setPosition(position: number): void {
    this._cursor = position;
  }

  public skip(size: number): void {
    this._cursor += size;
  }

  public dispose(): void {
    this._stream = Buffer.alloc(0);
    this._cursor = 0;
  }
}
