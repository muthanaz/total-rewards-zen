/**
 * CORS Configuration for Edge Functions
 * 
 * Restricts CORS to allowed domains only.
 * Localhost is permissive for development.
 */

// Allowed production/preview domains
const ALLOWED_ORIGINS = [
  // Production
  'https://total-rewards-zen.lovable.app',
  // Lovable preview domains
  /^https:\/\/.*--[a-f0-9-]+\.lovable\.app$/,
  // Localhost for development
  /^http:\/\/localhost(:\d+)?$/,
  /^http:\/\/127\.0\.0\.1(:\d+)?$/,
];

/**
 * Check if origin is allowed
 */
export function isOriginAllowed(origin: string | null): boolean {
  if (!origin) return false;
  
  return ALLOWED_ORIGINS.some((allowed) => {
    if (typeof allowed === 'string') {
      return origin === allowed;
    }
    // RegExp pattern
    return allowed.test(origin);
  });
}

/**
 * Get CORS headers for a request
 * Returns permissive headers for allowed origins, restrictive for others
 */
export function getCorsHeaders(req: Request): Record<string, string> {
  const origin = req.headers.get('origin');
  
  // For allowed origins, reflect the origin back
  if (origin && isOriginAllowed(origin)) {
    return {
      'Access-Control-Allow-Origin': origin,
      'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Max-Age': '86400',
    };
  }
  
  // For unknown origins, use restrictive CORS (will fail browser checks)
  return {
    'Access-Control-Allow-Origin': 'null',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  };
}

/**
 * Handle CORS preflight requests
 */
export function handleCorsPreflightRequest(req: Request): Response | null {
  if (req.method === 'OPTIONS') {
    return new Response(null, { 
      status: 204,
      headers: getCorsHeaders(req) 
    });
  }
  return null;
}

/**
 * Legacy permissive CORS headers (for backward compatibility)
 * @deprecated Use getCorsHeaders(req) instead
 */
export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};
