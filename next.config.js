/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        // Firebase Storage — all uploaded photos and blog covers
        protocol: "https",
        hostname: "firebasestorage.googleapis.com",
        pathname: "/**",
      },
      {
        // Firebase Storage alternative CDN hostname
        protocol: "https",
        hostname: "storage.googleapis.com",
        pathname: "/**",
      },
      {
        // Cloudinary image hosting
        protocol: "https",
        hostname: "res.cloudinary.com",
        pathname: "/**",
      },
    ],
  },
};

module.exports = nextConfig;
