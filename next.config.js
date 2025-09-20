/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: [
      '@google-cloud/documentai',
      '@google-cloud/language',
      '@google-cloud/translate',
      '@google-cloud/vertexai',
      '@google-cloud/storage',
    ],
  },
};

module.exports = nextConfig;
