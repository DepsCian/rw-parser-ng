import { ByteStream } from "./byte-stream";

export interface RwSectionHeader {
  sectionType: number;
  sectionSize: number;
  versionNumber: number;
}

export class RwFile extends ByteStream {
  constructor(stream: Buffer) {
    super(stream);
  }

  public readSectionHeader(): RwSectionHeader {
    if (this.getPosition() + 12 > this.getSize()) {
      throw new Error(
        `Cannot read section header at offset ${this.getPosition().toString(16)}: need 12 bytes but only ${this.getSize() - this.getPosition()} bytes remaining`,
      );
    }

    const sectionType = this.readUint32();
    const sectionSize = this.readUint32();
    const versionNumber = this.readUint32();

    return { sectionType, sectionSize, versionNumber };
  }
}
