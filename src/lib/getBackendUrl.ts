/**
 * Dynamically determines the backend URL based on the current hostname.
 * This allows the app to work when accessed from different machines on the network.
 */
export function getBackendUrl(): string {
  // If environment variable is explicitly set, use it
  if (process.env.NEXT_PUBLIC_API_URL) {
    console.log('[getBackendUrl] Using NEXT_PUBLIC_API_URL:', process.env.NEXT_PUBLIC_API_URL);
    return process.env.NEXT_PUBLIC_API_URL;
  }
  
  if (process.env.NEXT_PUBLIC_BACKEND_URL) {
    console.log('[getBackendUrl] Using NEXT_PUBLIC_BACKEND_URL:', process.env.NEXT_PUBLIC_BACKEND_URL);
    return process.env.NEXT_PUBLIC_BACKEND_URL;
  }

  // In browser environment, use current hostname
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    const protocol = window.location.protocol;
    
    console.log('[getBackendUrl] Browser environment - hostname:', hostname, 'protocol:', protocol);
    
    // If accessing via localhost, use localhost for backend
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      const url = 'http://localhost:5000';
      console.log('[getBackendUrl] Using localhost URL:', url);
      return url;
    }
    
    // For IP addresses or domain names, use the same hostname with port 5000
    const url = `${protocol}//${hostname}:5000`;
    console.log('[getBackendUrl] Using network URL:', url);
    return url;
  }

  // Server-side fallback
  console.log('[getBackendUrl] Server-side fallback to localhost:5000');
  return 'http://localhost:5000';
}

