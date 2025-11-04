/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  poweredByHeader: false,
  distDir: '.next',
  generateEtags: false,
  env: {
    PORT: '3001'
  },
  experimental: {
    serverComponentsExternalPackages: ['@prisma/client']
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'Access-Control-Allow-Credentials', value: 'true' },
          { 
            key: 'Access-Control-Allow-Origin', 
            value: process.env.NODE_ENV === 'production' 
              ? 'https://subvivah.com, https://www.subvivah.com' 
              : '*' 
          },
          { key: 'Access-Control-Allow-Methods', value: 'GET,DELETE,PATCH,POST,PUT' },
          { key: 'Access-Control-Allow-Headers', value: 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version' },
        ],
      },
    ]
  },
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        pathname: '/dl1f4tmca/**',
      },
      {
        protocol: 'https',
        hostname: 'subvivah.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'www.subvivah.com',
        pathname: '/**',
      },
    ],
  }
};

module.exports = nextConfig; 