import "./src/env.mjs"

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  // SVGR config
  webpack(config) {
    config.module.rules.push({
      test: /\.svg$/i,
      issuer: /\.[jt]sx?$/,
      use: [
        {
          loader: "@svgr/webpack",
          options: { svgo: false },
        },
      ],
    });
    return config;
  },
}

export default nextConfig
