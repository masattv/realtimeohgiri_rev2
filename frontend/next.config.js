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
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://b99a-2402-6b00-be46-7100-a824-f355-9d94-3095.ngrok-free.app/api/:path*';
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