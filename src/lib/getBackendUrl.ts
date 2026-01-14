/**
 * Dynamically determines the backend URL based on the current hostname.
 * This allows the app to work when accessed from different machines on the network.
 * For Vercel deployment, uses the deployed backend URL.
 */
export function getBackendUrl(): string {
  // If environment variable is explicitly set, use it (highest priority)
  if (process.env.NEXT_PUBLIC_API_URL) {
    console.log('[getBackendUrl] Using NEXT_PUBLIC_API_URL:', process.env.NEXT_PUBLIC_API_URL);
    return process.env.NEXT_PUBLIC_API_URL;
  }
  
  if (process.env.NEXT_PUBLIC_BACKEND_URL) {
    console.log('[getBackendUrl] Using NEXT_PUBLIC_BACKEND_URL:', process.env.NEXT_PUBLIC_BACKEND_URL);
    return process.env.NEXT_PUBLIC_BACKEND_URL;
  }

  // Check if frontend is deployed on Vercel (server-side or client-side detection)
  const isVercelDeployment = 
    typeof window !== 'undefined' 
      ? window.location.hostname.includes('vercel.app') || window.location.hostname.includes('vercel.com')
      : process.env.VERCEL || process.env.VERCEL_URL || process.env.NEXT_PUBLIC_VERCEL_URL;

  if (isVercelDeployment && !process.env.NEXT_PUBLIC_BACKEND_URL && !process.env.NEXT_PUBLIC_API_URL) {
    // You should set NEXT_PUBLIC_BACKEND_URL in Vercel environment variables
    // This is just a fallback - NOT recommended for production
    console.warn('[getBackendUrl] ⚠️ Using hardcoded backend URL. Please set NEXT_PUBLIC_BACKEND_URL in Vercel environment variables.');
    const url = 'https://mern-stack-dtgy.vercel.app';
    console.log('[getBackendUrl] Vercel deployment detected, using backend URL:', url);
    return url;
  }

  // In browser environment, use current hostname
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    const protocol = window.location.protocol;
    
    console.log('[getBackendUrl] Browser environment - hostname:', hostname, 'protocol:', protocol);
    
    // If accessing via localhost, check if env vars are set first
    // If env vars are set, use them even on localhost (for testing with remote backend)
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      // Only use localhost if no env vars are set
      // This allows testing with remote backend even on localhost
      const url = 'http://localhost:5000';
      console.log('[getBackendUrl] Using localhost URL (no env vars set):', url);
      console.warn('[getBackendUrl] ⚠️ No NEXT_PUBLIC_BACKEND_URL or NEXT_PUBLIC_API_URL set. Using localhost. Create .env.local with these variables to use remote backend.');
      return url;
    }
    
    // For IP addresses or other domain names, use the same hostname with port 5000
    const url = `${protocol}//${hostname}:5000`;
    console.log('[getBackendUrl] Using network URL:', url);
    return url;
  }

  // Server-side fallback
  console.log('[getBackendUrl] Server-side fallback to localhost:5000');
  return 'http://localhost:5000';
}

