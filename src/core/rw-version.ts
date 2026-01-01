const VERSIONS: Record<number, string> = {
  200704: "RenderWare 3.1.0.0 (III on PS2)",
  204800: "RenderWare 3.2.0.0 (III on PC)",
  208898: "RenderWare 3.3.0.2 (III on PC, VC on PS2)",
  212995: "RenderWare 3.4.0.3 (VC on PC)",
  212997: "RenderWare 3.4.0.5 (III on PS2, VC on Android/PC)",
  217088: "RenderWare 3.5.0.0 (III/VC on Xbox)",
  221187: "RenderWare 3.6.0.3 (SA)",
};

export function getVersionString(version: number): string {
  return VERSIONS[version] ?? "";
}

export function unpackVersion(version: number): number {
  if (version & 0xffff0000) {
    return (((version >> 14) & 0x3ff00) + 0x30000) | ((version >> 16) & 0x3f);
  }
  return version;
}

export function unpackBuild(version: number): number {
  return version & 0xffff0000 ? version & 0xffff : 0;
}
