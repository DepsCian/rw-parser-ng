export class RwParseError extends Error {}

export class RwParseStructureNotFoundError extends RwParseError {
  constructor(structureName: string) {
    super(`Structure ${structureName} not found.`);
  }
}
