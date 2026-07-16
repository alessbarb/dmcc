import { sql } from "drizzle-orm";
import { db } from "../../db/client.js";

export type AuthThrottlePurpose = "login_rate" | "register_rate" | "login_lockout";

interface CountWindowRow {
  count: number;
  window_reset_at: Date;
}

interface LockoutRow {
  locked_until: Date | null;
  window_reset_at: Date;
}

function toDate(ms: number): Date {
  return new Date(ms);
}

function asDate(value: unknown): Date {
  return value instanceof Date ? value : new Date(String(value));
}

function asCountWindowRow(row: Record<string, unknown>): CountWindowRow {
  return {
    count: Number(row.count),
    window_reset_at: asDate(row.window_reset_at),
  };
}

export async function consumeAuthRateLimit(params: {
  key: string;
  purpose: Extract<AuthThrottlePurpose, "login_rate" | "register_rate">;
  limit: number;
  windowMs: number;
  now?: number;
}): Promise<number | null> {
  const nowMs = params.now ?? Date.now();
  const now = toDate(nowMs);
  const windowResetAt = toDate(nowMs + params.windowMs);
  const result = await db.execute(sql`
    INSERT INTO auth_throttle_states (key, purpose, count, window_reset_at, locked_until, updated_at)
    VALUES (${params.key}, ${params.purpose}, 1, ${windowResetAt}, NULL, ${now})
    ON CONFLICT (key) DO UPDATE SET
      purpose = EXCLUDED.purpose,
      count = CASE
        WHEN auth_throttle_states.window_reset_at <= ${now} THEN 1
        ELSE auth_throttle_states.count + 1
      END,
      window_reset_at = CASE
        WHEN auth_throttle_states.window_reset_at <= ${now} THEN EXCLUDED.window_reset_at
        ELSE auth_throttle_states.window_reset_at
      END,
      locked_until = NULL,
      updated_at = ${now}
    RETURNING count, window_reset_at;
  `);
  const row = asCountWindowRow(result.rows[0] as Record<string, unknown>);
  if (row.count <= params.limit) return null;
  return Math.max(1, Math.ceil((row.window_reset_at.getTime() - nowMs) / 1000));
}

export async function getLoginLockoutRetryAfter(params: {
  key: string;
  now?: number;
}): Promise<number | null> {
  const nowMs = params.now ?? Date.now();
  const now = toDate(nowMs);
  await db.execute(sql`
    DELETE FROM auth_throttle_states
    WHERE key = ${params.key}
      AND purpose = 'login_lockout'
      AND window_reset_at <= ${now}
      AND (locked_until IS NULL OR locked_until <= ${now});
  `);
  const result = await db.execute(sql`
    SELECT locked_until, window_reset_at
    FROM auth_throttle_states
    WHERE key = ${params.key}
      AND purpose = 'login_lockout'
    LIMIT 1;
  `);
  const row = result.rows[0] as Record<string, unknown> | undefined;
  if (!row) return null;
  const lockout: LockoutRow = {
    locked_until: row.locked_until ? asDate(row.locked_until) : null,
    window_reset_at: asDate(row.window_reset_at),
  };
  return lockout.locked_until && lockout.locked_until.getTime() > nowMs
    ? Math.max(1, Math.ceil((lockout.locked_until.getTime() - nowMs) / 1000))
    : null;
}

export async function recordFailedLogin(params: {
  key: string;
  windowMs: number;
  threshold: number;
  baseLockoutMs: number;
  maxLockoutMs: number;
  now?: number;
}): Promise<void> {
  const nowMs = params.now ?? Date.now();
  const now = toDate(nowMs);
  const windowResetAt = toDate(nowMs + params.windowMs);
  const result = await db.execute(sql`
    INSERT INTO auth_throttle_states (key, purpose, count, window_reset_at, locked_until, updated_at)
    VALUES (${params.key}, 'login_lockout', 1, ${windowResetAt}, NULL, ${now})
    ON CONFLICT (key) DO UPDATE SET
      purpose = 'login_lockout',
      count = CASE
        WHEN auth_throttle_states.window_reset_at <= ${now} THEN 1
        ELSE auth_throttle_states.count + 1
      END,
      window_reset_at = CASE
        WHEN auth_throttle_states.window_reset_at <= ${now} THEN EXCLUDED.window_reset_at
        ELSE auth_throttle_states.window_reset_at
      END,
      updated_at = ${now}
    RETURNING count, window_reset_at;
  `);
  const row = asCountWindowRow(result.rows[0] as Record<string, unknown>);
  if (row.count < params.threshold) return;

  const step = row.count - params.threshold;
  const lockoutMs = Math.min(params.maxLockoutMs, params.baseLockoutMs * (2 ** step));
  const lockedUntil = toDate(nowMs + lockoutMs);
  await db.execute(sql`
    UPDATE auth_throttle_states
    SET locked_until = ${lockedUntil}, updated_at = ${now}
    WHERE key = ${params.key}
      AND purpose = 'login_lockout';
  `);
}

export async function clearLoginLockout(key: string): Promise<void> {
  await db.execute(sql`
    DELETE FROM auth_throttle_states
    WHERE key = ${key}
      AND purpose = 'login_lockout';
  `);
}
