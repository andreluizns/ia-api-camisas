import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  devIndicators: false,
  turbopack: {
    root: __dirname,
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",   // permite qualquer domínio HTTPS (adequado para dev/imagens de produto)
      },
      {
        protocol: "http",
        hostname: "localhost",
      },
    ],
  },
}

export default nextConfig
