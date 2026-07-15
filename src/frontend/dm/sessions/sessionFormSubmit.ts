export function errorMessage(err: unknown): string {
  return err instanceof Error ? err.message : String(err);
}

export function runSessionAction(operation: Promise<unknown>, errorLogMessage: string): void {
  void operation.catch((error: unknown) => {
    console.error(errorLogMessage, error);
  });
}
