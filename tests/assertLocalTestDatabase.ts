const LOCAL_DATABASE_HOSTS = new Set([
  "localhost",
  "127.0.0.1",
  "::1",
  "[::1]",
]);

export function assertLocalTestDatabase(context: string): void {
  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    throw new Error(
      `${context} requires an explicit local DATABASE_URL.`,
    );
  }

  let hostname: string;

  try {
    hostname = new URL(connectionString).hostname.toLowerCase();
  } catch {
    throw new Error(`${context} received an invalid DATABASE_URL.`);
  }

  if (!LOCAL_DATABASE_HOSTS.has(hostname)) {
    throw new Error(
      `${context} refuses to run against remote database host "${hostname}".`,
    );
  }
}
