/** @type {import('next').NextConfig} */
// GitHub Pages 静的エクスポート用。basePath は環境変数で切替（ローカルdevは空）。
const base = process.env.NEXT_PUBLIC_BASE_PATH || "";

const nextConfig = {
  reactStrictMode: true,
  output: "export",
  basePath: base,
  assetPrefix: base || undefined,
  trailingSlash: true,
  images: { unoptimized: true },
};

export default nextConfig;
