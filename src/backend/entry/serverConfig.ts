export function resolveListenHost(env: Partial<Record<"DMCC_HOST", string | undefined>>): string {
  return env.DMCC_HOST ?? "127.0.0.1";
}

export function formatListenUrl(host: string, port: number): string {
  const displayHost = host === "0.0.0.0" ? "localhost" : host;
  return `http://${displayHost}:${port}`;
}
