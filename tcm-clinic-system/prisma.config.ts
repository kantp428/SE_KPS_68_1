import { defineConfig } from "@prisma/config";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";

const envLocalPath = path.resolve(process.cwd(), ".env.local");

if (!process.env.DATABASE_URL && fs.existsSync(envLocalPath)) {
  dotenv.config({ path: envLocalPath });
}

const dbUrl = process.env.DATABASE_URL;

if (!dbUrl) {
  throw new Error("DATABASE_URL is not defined");
}

export default defineConfig({
  schema: "prisma/schema.prisma",
  datasource: {
    url: dbUrl,
  },
});
