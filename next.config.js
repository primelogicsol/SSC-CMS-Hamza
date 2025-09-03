/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: { ignoreDuringBuilds: true },
  reactStrictMode: true,
  async rewrites() {
    return [
      {
        source: "/v1/:path*",
        destination: `${process.env.NEXT_PUBLIC_BACKEND_URL}/v1/:path*`,
      },
    ];
  },
};
export default nextConfig;
