import type { NextConfig } from "next";
const config: NextConfig = {
  env: {
    NEXT_PUBLIC_BUILD: (process.env.VERCEL_GIT_COMMIT_SHA || String(Date.now())).slice(0, 7),
  },
  serverExternalPackages: ["pg", "@electric-sql/pglite"],
};
export default config;
