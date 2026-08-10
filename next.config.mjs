/** @type {import('next').NextConfig} */
const nextConfig = {
  async headers() {
    return [
      {
        // match all API routes
        source: "/api/:path*",
        headers: [
          { key: "Access-Control-Allow-Credentials", value: "true" },
          // For local development and production, we allow the app subdomain origins.
          // Note: Next.js doesn't support dynamic origins here, so we will handle dynamic
          // Origin checking in middleware if needed, but since app.vichith.in is trusted,
          // we can specify it directly for production, and use environment variables if needed.
          // For V1, since it's hardcoded to app.vichith.in, we will allow it.
          // However, to support local dev (e.g. app.localhost:3000), it's better to allow the
          // requested origin if it matches our allowed list, but Next.js static headers require 
          // a specific string. We'll set it in middleware or leave it as a wildcard for now if 
          // credentials aren't true. Since credentials are true, we can't use "*".
          // We will set up CORS properly in middleware.ts instead to support both prod and local.
        ]
      }
    ]
  }
};

export default nextConfig;
