// next.config.js - Optimized for Cloud Run deployment with SSR fix
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,

  // CRITICAL: Enable standalone output for Docker
  output: 'standalone',

  // Optimize for Cloud Run
  compress: true,
  
  // Configure headers for security
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on'
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload'
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block'
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin'
          }
        ]
      }
    ];
  },

  // CRITICAL: Webpack configuration for Cloud Run and Firebase
  webpack: (config, { isServer }) => {
    if (isServer) {
      // Optimize for server-side
      config.externals = [...(config.externals || []), 'canvas', 'jsdom'];
    } else {
      // CRITICAL FIX: Don't resolve Firebase Admin on the client
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        crypto: false,
      };
    }
    
    return config;
  },

  // CRITICAL: Environment variables for build time
  // These are dummy values for build, real ones injected at runtime
  env: {
    NEXT_PUBLIC_FIREBASE_API_KEY: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || 'dummy-build-key',
    NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || 'dummy.firebaseapp.com',
    NEXT_PUBLIC_FIREBASE_PROJECT_ID: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'dummy-project',
    NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || 'dummy.appspot.com',
    NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '123456',
    NEXT_PUBLIC_FIREBASE_APP_ID: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || 'dummy-app-id',
  },

  // Image optimization for Cloud Run
  images: {
    domains: ['firebasestorage.googleapis.com'],
    unoptimized: true, // Required for Cloud Run
  },

  // Experimental features for performance
  experimental: {
    // Optimize package imports
    optimizePackageImports: ['lucide-react', 'recharts'],
  },

  // Disable x-powered-by header
  poweredByHeader: false,

  // Disable telemetry
  telemetry: false,

  // Production optimizations
  ...(process.env.NODE_ENV === 'production' && {
    compiler: {
      removeConsole: {
        exclude: ['error', 'warn'],
      },
    },
  }),
};

module.exports = nextConfig;