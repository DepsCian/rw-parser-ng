const VERSIONS: Record<number, string> = {
  0x31000: "RenderWare 3.1.0.0 (III on PS2)",
  0x32000: "RenderWare 3.2.0.0 (III on PC)",
  0x33002: "RenderWare 3.3.0.2 (III on PC, VC on PS2)",
  0x34003: "RenderWare 3.4.0.3 (VC on PC)",
  0x34005: "RenderWare 3.4.0.5 (III on PS2, VC on Android/PC)",
  0x35000: "RenderWare 3.5.0.0 (III/VC on Xbox)",
  0x36003: "RenderWare 3.6.0.3 (SA)",
};

export function getVersionString(version: number): string {
  return VERSIONS[version] ?? "";
}

export function unpackVersion(version: number): number {
  if (version & 0xffff0000) {
    return ((version >> 14) & 0x3ff00) + 0x30000 | ((version >> 16) & 0x3f);
  }
  return version;
}

export function unpackBuild(version: number): number {
  return (version & 0xffff0000) ? version & 0xffff : 0;
}
