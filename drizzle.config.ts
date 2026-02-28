import { defineConfig } from "drizzle-kit";

const dbUrl = process.env.DATABASE_URL || process.env.MYSQL_DATABASE_URL;
if (!dbUrl) {
  throw new Error(
    "DATABASE_URL or MYSQL_DATABASE_URL is required (e.g. mysql://root:pass@localhost:3306/db)"
  );
}

export default defineConfig({
  out: "./migrations",
  schema: "./shared/schema.ts",
  dialect: "mysql",
  dbCredentials: {
    url: dbUrl,
  },
});
