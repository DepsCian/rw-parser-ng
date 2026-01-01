export interface RwTxd {
  textureDictionary: RwTextureDictionary;
}

export interface RwTextureDictionary {
  textureCount: number;
  textureNatives: RwTextureNative[];
}

export interface RwTextureNative {
  platformId: number;
  filterMode: number;
  uAddressing: number;
  vAddressing: number;
  textureName: string;
  maskName: string;
  rasterFormat: number;
  d3dFormat: string;
  width: number;
  height: number;
  depth: number;
  mipmapCount: number;
  rasterType: number;
  alpha: boolean;
  cubeTexture: boolean;
  autoMipMaps: boolean;
  compressed: boolean;
  mipmaps: number[][];
}
