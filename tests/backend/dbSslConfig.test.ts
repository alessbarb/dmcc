import { describe, expect, it } from "vitest";
import { resolveDatabaseSslConfig } from "../../src/backend/db/client.js";

const remoteUrl = "postgresql://dmcc_app:secret@db.example.com:5432/dmcc";
const localhostUrl = "postgresql://dmcc:secret@localhost:5432/dmcc";
const loopbackUrl = "postgresql://dmcc:secret@127.0.0.1:5432/dmcc";
const unixSocketUrl = "postgresql://dmcc:secret@localhost/dmcc?host=/var/run/postgresql";

describe("database SSL configuration", () => {
  it("requires TLS by default for remote hosts", () => {
    expect(resolveDatabaseSslConfig({ databaseUrl: remoteUrl, env: {} })).toBe(true);
  });

  it("does not require TLS by default for localhost, loopback, or Unix sockets", () => {
    expect(resolveDatabaseSslConfig({ databaseUrl: localhostUrl, env: {} })).toBeUndefined();
    expect(resolveDatabaseSslConfig({ databaseUrl: loopbackUrl, env: {} })).toBeUndefined();
    expect(resolveDatabaseSslConfig({ databaseUrl: unixSocketUrl, env: {} })).toBeUndefined();
  });

  it("honors DATABASE_SSL_MODE=require for local hosts", () => {
    expect(resolveDatabaseSslConfig({ databaseUrl: localhostUrl, env: { DATABASE_SSL_MODE: "require" } })).toBe(true);
  });

  it("allows DATABASE_SSL_MODE=disable for remote hosts outside production", () => {
    expect(resolveDatabaseSslConfig({ databaseUrl: remoteUrl, env: { NODE_ENV: "development", DATABASE_SSL_MODE: "disable" } })).toBeUndefined();
  });

  it("fails in production when a remote host explicitly disables TLS", () => {
    expect(() =>
      resolveDatabaseSslConfig({ databaseUrl: remoteUrl, env: { NODE_ENV: "production", DATABASE_SSL_MODE: "disable" } }),
    ).toThrow(/DATABASE_SSL_MODE=disable is not allowed/);
  });

  it("rejects unknown DATABASE_SSL_MODE values", () => {
    expect(() => resolveDatabaseSslConfig({ databaseUrl: remoteUrl, env: { DATABASE_SSL_MODE: "prefer" } })).toThrow(
      /DATABASE_SSL_MODE must be one of/,
    );
  });

  it("rejects malformed DATABASE_URL values", () => {
    expect(() => resolveDatabaseSslConfig({ databaseUrl: "not a url", env: {} })).toThrow(/DATABASE_URL must be a valid/);
  });
});
