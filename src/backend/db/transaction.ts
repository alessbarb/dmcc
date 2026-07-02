import { db } from "./client.js";
import type { DbTransaction } from "./client.js";

export async function withTransaction<T>(
  fn: (tx: DbTransaction) => Promise<T>
): Promise<T> {
  return await db.transaction(fn);
}
