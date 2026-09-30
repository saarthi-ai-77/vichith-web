/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['gsap', '@gsap/react'],
  async headers() {
    return [
      {
        // match all API routes
        source: "/api/:path*",
        headers: [
          { key: "Access-Control-Allow-Credentials", value: "true" },
        ]
      }
    ]
  }
};

export default nextConfig;
