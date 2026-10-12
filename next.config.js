/** @type {import('next').NextConfig} */
const supabaseUrl = new URL(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co"
);

const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: supabaseUrl.protocol.replace(":", ""),
        hostname: supabaseUrl.hostname,
        port: supabaseUrl.port,
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },
};

module.exports = nextConfig;
