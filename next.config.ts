import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60,

  },
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  // 가격 페이지 삭제(2026-10-30). 기존 링크와 광고 유입은 상품, 가격이 안내되는 문의 페이지로 보낸다.
  async redirects() {
    return [{ source: '/pricing', destination: '/inquiry', permanent: false }];
  },
};

export default nextConfig;
