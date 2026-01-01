import { RwFile } from "../core/rw-file";
import { RwIfp } from "./types";
import { readAnp3 } from "./readers/anp3";
import { readAnpk } from "./readers/anpk";

export class IfpParser extends RwFile {
  constructor(buffer: Buffer) {
    super(buffer);
  }

  public parse(): RwIfp {
    const signature = this.readString(4);
    this.setPosition(0);

    if (signature === "ANP3") return readAnp3(this);
    if (signature === "ANPK") return readAnpk(this);

    throw new Error("Unsupported IFP version");
  }
}
