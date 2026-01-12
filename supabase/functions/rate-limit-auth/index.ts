import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// In-memory rate limit store (resets on function cold start)
// For production, consider using Redis or database-backed storage
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute window
const MAX_REQUESTS_PER_WINDOW = 5; // 5 attempts per minute per IP

function getRateLimitKey(ip: string, action: string): string {
  return `${ip}:${action}`;
}

function isRateLimited(key: string): { limited: boolean; remaining: number; resetIn: number } {
  const now = Date.now();
  const entry = rateLimitStore.get(key);
  
  if (!entry || entry.resetTime < now) {
    // Reset or create new window
    rateLimitStore.set(key, { count: 1, resetTime: now + RATE_LIMIT_WINDOW_MS });
    return { limited: false, remaining: MAX_REQUESTS_PER_WINDOW - 1, resetIn: RATE_LIMIT_WINDOW_MS };
  }
  
  if (entry.count >= MAX_REQUESTS_PER_WINDOW) {
    return { limited: true, remaining: 0, resetIn: entry.resetTime - now };
  }
  
  entry.count++;
  rateLimitStore.set(key, entry);
  return { limited: false, remaining: MAX_REQUESTS_PER_WINDOW - entry.count, resetIn: entry.resetTime - now };
}

// Cleanup old entries periodically
function cleanupOldEntries() {
  const now = Date.now();
  for (const [key, entry] of rateLimitStore.entries()) {
    if (entry.resetTime < now) {
      rateLimitStore.delete(key);
    }
  }
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  // Cleanup old entries
  cleanupOldEntries();

  try {
    const clientIP = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || 
                     req.headers.get("x-real-ip") || 
                     "unknown";
    
    const { action, email } = await req.json();
    
    if (!action || !["login", "signup"].includes(action)) {
      return new Response(
        JSON.stringify({ error: "Invalid action" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Use both IP and email for rate limiting to prevent account enumeration
    const ipKey = getRateLimitKey(clientIP, action);
    const emailKey = email ? getRateLimitKey(email, action) : null;
    
    const ipRateLimit = isRateLimited(ipKey);
    const emailRateLimit = emailKey ? isRateLimited(emailKey) : { limited: false, remaining: MAX_REQUESTS_PER_WINDOW, resetIn: 0 };
    
    if (ipRateLimit.limited || emailRateLimit.limited) {
      const resetIn = Math.max(ipRateLimit.resetIn, emailRateLimit.resetIn);
      return new Response(
        JSON.stringify({ 
          error: "Too many authentication attempts. Please try again later.",
          retryAfter: Math.ceil(resetIn / 1000)
        }),
        { 
          status: 429, 
          headers: { 
            ...corsHeaders, 
            "Content-Type": "application/json",
            "Retry-After": Math.ceil(resetIn / 1000).toString(),
            "X-RateLimit-Remaining": "0",
            "X-RateLimit-Reset": Math.ceil(resetIn / 1000).toString()
          } 
        }
      );
    }

    // Return success with rate limit headers
    const remaining = Math.min(ipRateLimit.remaining, emailRateLimit.remaining);
    return new Response(
      JSON.stringify({ 
        allowed: true,
        remaining
      }),
      { 
        status: 200, 
        headers: { 
          ...corsHeaders, 
          "Content-Type": "application/json",
          "X-RateLimit-Remaining": remaining.toString(),
          "X-RateLimit-Limit": MAX_REQUESTS_PER_WINDOW.toString()
        } 
      }
    );
  } catch (error) {
    console.error("Rate limit error:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
