import { defineConfig } from "@prisma/config";
import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

const dbUrl = process.env.DATABASE_URL;

if (!dbUrl) {
  console.error("Error: DATABASE_URL is undefined in .env.local");
} else {
  console.log("DATABASE_URL loaded successfully");
}

export default defineConfig({
  schema: "prisma/schema.prisma",
  datasource: {
    url: dbUrl!,
  },
});
