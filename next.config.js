/** @type {import('next').NextConfig} */
const nextConfig = {
  // basePath 和 assetPrefix 设置确保资源正确加载，当部署到非根目录时
  basePath: '/TableOCR',
  assetPrefix: '/TableOCR/',
  output: "export",
};
module.exports = nextConfig;

