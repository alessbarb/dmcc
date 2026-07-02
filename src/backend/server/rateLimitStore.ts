import { readFile, writeFile, mkdir } from "node:fs/promises";
import { join } from "node:path";

export interface RateLimitEntry {
  count: number;
  resetAt: number;
}

export interface LockoutEntry {
  count: number;
  lockedUntil: number;
  lastAttemptAt: number;
}

type StoreData = Record<string, RateLimitEntry | LockoutEntry>;

const PRUNE_INTERVAL_MS = 5 * 60 * 1000;

export class PersistentRateLimit {
  private data: Map<string, RateLimitEntry | LockoutEntry>;
  private dirty = false;
  private flushTimer: ReturnType<typeof setTimeout> | null = null;
  private lastPrune = 0;

  constructor(
    private readonly filePath: string,
    initial: StoreData = {}
  ) {
    this.data = new Map(Object.entries(initial));
  }

  static async load(vaultDir: string, name: string): Promise<PersistentRateLimit> {
    const path = join(vaultDir, `rate-limits-${name}.json`);
    try {
      const raw = await readFile(path, "utf8");
      const parsed = JSON.parse(raw) as StoreData;
      return new PersistentRateLimit(path, parsed);
    } catch {
      return new PersistentRateLimit(path, {});
    }
  }

  get<T extends RateLimitEntry | LockoutEntry>(key: string): T | undefined {
    return this.data.get(key) as T | undefined;
  }

  set(key: string, value: RateLimitEntry | LockoutEntry): void {
    this.data.set(key, value);
    this.scheduleFlush();
  }

  delete(key: string): void {
    this.data.delete(key);
    this.scheduleFlush();
  }

  async close(): Promise<void> {
    if (this.flushTimer) {
      clearTimeout(this.flushTimer);
      this.flushTimer = null;
    }
    await this.flush();
  }

  private scheduleFlush(): void {
    if (this.flushTimer) return;
    this.dirty = true;
    this.flushTimer = setTimeout(() => {
      this.flushTimer = null;
      void this.flush();
    }, 500);
  }

  private async flush(): Promise<void> {
    if (!this.dirty) return;
    this.dirty = false;
    this.prune();
    const obj: StoreData = Object.fromEntries(this.data.entries());
    try {
      await mkdir(join(this.filePath, ".."), { recursive: true });
      await writeFile(this.filePath, JSON.stringify(obj), "utf8");
    } catch {
      // Best-effort persistence — loss of state only affects lockout durability
    }
  }

  private prune(): void {
    const now = Date.now();
    if (now - this.lastPrune < PRUNE_INTERVAL_MS) return;
    this.lastPrune = now;
    for (const [key, entry] of this.data) {
      const expiry = "resetAt" in entry ? entry.resetAt : entry.lockedUntil;
      if (expiry < now) this.data.delete(key);
    }
  }
}
