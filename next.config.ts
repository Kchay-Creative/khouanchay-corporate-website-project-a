import type { NextConfig } from "next";
const nextConfig: NextConfig = {
  agentRules: false,
  redirects() {
    return [{ source: "/", destination: "/home", permanent: false }];
  },
};
export default nextConfig;
