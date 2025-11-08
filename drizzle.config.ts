import { defineConfig } from "drizzle-kit";

const dbUrl = process.env.EXTERNAL_DATABASE_URL || process.env.DATABASE_URL;

if (!dbUrl) {
  throw new Error("EXTERNAL_DATABASE_URL or DATABASE_URL must be set, ensure the database is provisioned");
}

export default defineConfig({
  out: "./migrations",
  schema: "./shared/schema.ts",
  dialect: "postgresql",
  dbCredentials: {
    url: dbUrl,
  },
});
