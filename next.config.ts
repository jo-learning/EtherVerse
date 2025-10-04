import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  // async headers() {
  //   return [
  //     {
  //       source: '/:path*',
  //       headers: [
  //         {
  //           key: 'Content-Security-Policy',
  //           value: [
  //             "default-src 'self'",
  //             "connect-src 'self' https://test.nobsmart.com https://api.coingecko.com https://api.binance.com wss://test.nobsmart.com wss://stream.binance.com wss://fstream.binance.com",
  //             "img-src 'self' data: https://api.coingecko.com https://assets.coingecko.com",
  //             "script-src 'self' 'unsafe-inline'",
  //             "style-src 'self' 'unsafe-inline'",
  //           ].join('; ')
  //         },
  //       ],
  //     },
  //   ];
  // },
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },

};

export default nextConfig;
