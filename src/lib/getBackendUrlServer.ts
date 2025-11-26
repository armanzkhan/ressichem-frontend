/**
 * Server-side function to get the backend URL.
 * This is used in Next.js API routes (server-side only).
 * For client-side, use getBackendUrl() instead.
 */
export function getBackendUrlServer(): string {
  // If environment variable is explicitly set, use it (highest priority)
  if (process.env.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL;
  }
  
  if (process.env.NEXT_PUBLIC_BACKEND_URL) {
    return process.env.NEXT_PUBLIC_BACKEND_URL;
  }

  // Check if deployed on Vercel (but still prefer env vars if set)
  // Only use hardcoded URL if no env vars are set AND we're on Vercel
  if ((process.env.VERCEL || process.env.VERCEL_URL) && !process.env.NEXT_PUBLIC_BACKEND_URL && !process.env.NEXT_PUBLIC_API_URL) {
    // You should set NEXT_PUBLIC_BACKEND_URL in Vercel environment variables
    // This is just a fallback - NOT recommended for production
    console.warn('⚠️ Using hardcoded backend URL. Please set NEXT_PUBLIC_BACKEND_URL in Vercel environment variables.');
    return 'https://mern-stack-dtgy.vercel.app';
  }

  // Fallback to localhost for local development
  return 'http://localhost:5000';
}

