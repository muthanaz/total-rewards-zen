/**
 * Environment utilities for detecting development vs production mode
 */

export const isDevelopment = (): boolean => {
  // Check for common development indicators
  const hostname = typeof window !== 'undefined' ? window.location.hostname : '';
  
  // Lovable preview URLs or localhost indicate development
  const devHostnames = [
    'localhost',
    '127.0.0.1',
    'lovableproject.com',  // Lovable preview domains
  ];
  
  // Check if any dev hostname matches
  const isDevHost = devHostnames.some(dev => hostname.includes(dev) || hostname === dev);
  
  // Also check Vite's dev mode
  const isViteDev = import.meta.env.DEV;
  
  return isDevHost || isViteDev;
};

export const isProduction = (): boolean => {
  return !isDevelopment();
};
