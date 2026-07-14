import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: [
    "./src/backend/db/schema.ts",
    "./src/backend/db/authSchema.ts",
    "./src/backend/db/playerPortalSchema.ts",
    "./src/backend/db/messagingSchema.ts",
    "./src/backend/db/operationsSchema.ts",
    "./src/backend/db/announcementsSchema.ts",
    "./src/backend/db/catalogSettingsSchema.ts",
  ],
  out: "./src/backend/db/migrations",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL ?? "postgresql://dmcc:dmcc_password@localhost:5432/dmcc",
  },
});
