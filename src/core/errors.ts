export class RwParseError extends Error {
  constructor(message?: string) {
    super(message);
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export class RwParseStructureNotFoundError extends RwParseError {
  constructor(structureName: string) {
    super(`Structure ${structureName} not found.`);
  }
}
