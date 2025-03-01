/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    // ビルド時のESLintチェックを無効にする
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: process.env.NEXT_PUBLIC_BACKEND_URL || 'https://f245-2402-6b00-be46-7100-40bc-4f6-7e50-f89f.ngrok-free.app/api/:path*',
      },
    ]
  },
}

module.exports = nextConfig 