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
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000/api/:path*';
    console.log(`Using backend URL: ${backendUrl}`);
    return [
      {
        source: '/api/:path*',
        destination: backendUrl,
      },
    ]
  },
}

module.exports = nextConfig 