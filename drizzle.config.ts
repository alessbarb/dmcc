import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: [
    "./src/backend/db/schema.ts",
    "./src/backend/db/playerPortalSchema.ts",
  ],
  out: "./src/backend/db/migrations",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL ?? "postgresql://dmcc:dmcc_password@localhost:5432/dmcc",
  },
});
