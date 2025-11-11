/** @type {import("next").NextConfig} */
const nextConfig = {
  // Minimal configuration to avoid webpack issues
  reactStrictMode: false,
  
  // Output configuration for Vercel (default - no output needed)
  // Vercel handles Next.js deployment automatically
  
  // Environment variables
  env: {
    NEXT_PUBLIC_BACKEND_URL: process.env.NEXT_PUBLIC_BACKEND_URL || (process.env.VERCEL ? 'https://mern-stack-dtgy.vercel.app' : 'http://localhost:5000'),
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || (process.env.VERCEL ? 'https://mern-stack-dtgy.vercel.app' : 'http://localhost:5000'),
  },
  
  // Simple webpack config
  webpack: (config) => {
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
    };
    return config;
  },
};

export default nextConfig;
