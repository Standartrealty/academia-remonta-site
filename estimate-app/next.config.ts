import type { NextConfig } from 'next';
const config: NextConfig = { output: 'export', basePath: '/smeta', images: { unoptimized: true }, poweredByHeader: false, reactStrictMode: true };
export default config;
