import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@ppt-maker/core"],
  serverExternalPackages: ["pptxgenjs", "pdf-lib", "jszip", "fast-xml-parser"],
};

export default nextConfig;
