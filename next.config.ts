import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    /* config options here */
    reactCompiler: true,
    basePath: "/portofolio/show/test-sharing-vision-nextjs", // For Deploy To Kubernetes
    assetPrefix: "/portofolio/show/test-sharing-vision-nextjs", // For Deploy To Kubernetes
};

export default nextConfig;
