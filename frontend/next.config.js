/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    // ビルド時のESLintチェックを無効にする
    ignoreDuringBuilds: true,
  },
}

module.exports = nextConfig 