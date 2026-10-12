/** @type {import('next').NextConfig} */
const supabaseUrl = new URL(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co",
);

// Next blocks optimizing images from private IPs to prevent SSRF. Local
// Supabase (`npx supabase start`) serves from 127.0.0.1, so allow it only
// in that case; remotePatterns still limits images to that one host.
const isLocalSupabase = ["127.0.0.1", "localhost", "[::1]"].includes(
  supabaseUrl.hostname,
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
    dangerouslyAllowLocalIP: isLocalSupabase,
  },
};

module.exports = nextConfig;
