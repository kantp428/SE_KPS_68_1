import { defineConfig } from "@prisma/config";
import "dotenv/config";

// $env:DATABASE_URL="your_actual_connection_string_here"; npx prisma db pull
export default defineConfig({
  schema: "prisma/schema.prisma",
  datasource: {
    url: process.env.DATABASE_URL,
  },
});
