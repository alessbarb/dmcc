export const APP_VERSION = "0.1.0";
export const EVENT_SCHEMA_VERSION = 1;
export const SNAPSHOT_SCHEMA_VERSION = 1;
export const PROJECTION_SCHEMA_VERSION = 1;
export const BACKUP_SCHEMA_VERSION = 1;
export const BACKUP_FORMAT_VERSION = 2;

export const VERSION_INFO = {
  appVersion: APP_VERSION,
  eventSchemaVersion: EVENT_SCHEMA_VERSION,
  snapshotSchemaVersion: SNAPSHOT_SCHEMA_VERSION,
  projectionSchemaVersion: PROJECTION_SCHEMA_VERSION,
  backupSchemaVersion: BACKUP_SCHEMA_VERSION,
  backupFormatVersion: BACKUP_FORMAT_VERSION,
} as const;
