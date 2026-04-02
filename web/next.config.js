/** @type {import('next').NextConfig} */
const nextConfig = {
  logging: {
    browserToTerminal: false,
  },
  // @ts-ignore
  allowedDevOrigins: ["localhost:3000", "26.16.96.96:3000", "26.16.96.96", "0.0.0.0:3000", "0.0.0.0"],
  reactCompiler: false,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
      },
    ],
  },
  async rewrites() {
    return [
      {
        source: '/api/qr/:path*',
        destination: `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api'}/qr/:path*`,
      },
    ];
  },
};

module.exports = nextConfig;
console.log('>>> Standard next.config.js loaded with allowedDevOrigins:', nextConfig.allowedDevOrigins);
