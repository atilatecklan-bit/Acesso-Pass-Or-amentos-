import type { NextConfig } from "next";
const config: NextConfig = {
  serverExternalPackages: ["pg", "@electric-sql/pglite"],
};
export default config;
