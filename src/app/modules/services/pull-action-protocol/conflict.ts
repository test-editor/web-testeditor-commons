export class Conflict {
  constructor(readonly message: string, readonly backupFilePath?: string) { }
}

export function isConflict(conflict: Conflict | string): conflict is Conflict {
  return (conflict !== null) && (<Conflict>conflict).message !== undefined;
}
