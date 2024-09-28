/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'i.scdn.co',
      },
    ],
    domains: ['localhost', 'i.scdn.co'], // Add this line
  },
}

module.exports = nextConfig