import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { getCorsHeaders, handleCorsPreflightRequest } from "../_shared/cors.ts";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

// Configuration
const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_DURATION_MINUTES = 15;
const ATTEMPT_WINDOW_MINUTES = 15;

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

interface LockoutRequest {
  action: 'check' | 'record_attempt' | 'record_success';
  email: string;
  ip_address?: string;
}

serve(async (req) => {
  // Handle CORS preflight
  const preflightResponse = handleCorsPreflightRequest(req);
  if (preflightResponse) return preflightResponse;

  const corsHeaders = getCorsHeaders(req);

  try {
    const { action, email, ip_address }: LockoutRequest = await req.json();

    if (!email) {
      return new Response(
        JSON.stringify({ error: "Email is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const normalizedEmail = email.toLowerCase().trim();

    switch (action) {
      case 'check': {
        // Check if account is locked
        const { data: lockout } = await supabase
          .from('account_lockouts')
          .select('*')
          .eq('email', normalizedEmail)
          .single();

        if (lockout && new Date(lockout.locked_until) > new Date()) {
          const remainingMinutes = Math.ceil(
            (new Date(lockout.locked_until).getTime() - Date.now()) / 60000
          );
          return new Response(
            JSON.stringify({ 
              locked: true, 
              remaining_minutes: remainingMinutes,
              message: `Account temporarily locked. Try again in ${remainingMinutes} minute(s).`
            }),
            { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        // Check recent failed attempts
        const windowStart = new Date(Date.now() - ATTEMPT_WINDOW_MINUTES * 60 * 1000).toISOString();
        const { count } = await supabase
          .from('login_attempts')
          .select('*', { count: 'exact', head: true })
          .eq('email', normalizedEmail)
          .eq('success', false)
          .gte('attempt_time', windowStart);

        const attemptsRemaining = MAX_FAILED_ATTEMPTS - (count || 0);

        return new Response(
          JSON.stringify({ 
            locked: false, 
            attempts_remaining: attemptsRemaining,
            max_attempts: MAX_FAILED_ATTEMPTS
          }),
          { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      case 'record_attempt': {
        // Record failed attempt
        await supabase.from('login_attempts').insert({
          email: normalizedEmail,
          ip_address: ip_address || null,
          success: false
        });

        // Count recent failed attempts
        const windowStart = new Date(Date.now() - ATTEMPT_WINDOW_MINUTES * 60 * 1000).toISOString();
        const { count } = await supabase
          .from('login_attempts')
          .select('*', { count: 'exact', head: true })
          .eq('email', normalizedEmail)
          .eq('success', false)
          .gte('attempt_time', windowStart);

        const failedCount = count || 0;

        // Lock account if threshold exceeded
        if (failedCount >= MAX_FAILED_ATTEMPTS) {
          const lockedUntil = new Date(Date.now() + LOCKOUT_DURATION_MINUTES * 60 * 1000);
          
          await supabase.from('account_lockouts').upsert({
            email: normalizedEmail,
            locked_at: new Date().toISOString(),
            locked_until: lockedUntil.toISOString(),
            failed_attempts: failedCount,
            notification_sent: false
          }, { onConflict: 'email' });

          // Send notification email if RESEND_API_KEY is configured
          const resendApiKey = Deno.env.get("RESEND_API_KEY");
          if (resendApiKey) {
            try {
              await sendLockoutNotification(normalizedEmail, resendApiKey);
              await supabase
                .from('account_lockouts')
                .update({ notification_sent: true })
                .eq('email', normalizedEmail);
            } catch (emailError) {
              console.error('Failed to send lockout notification:', emailError);
            }
          }

          return new Response(
            JSON.stringify({ 
              locked: true, 
              remaining_minutes: LOCKOUT_DURATION_MINUTES,
              message: `Account locked due to too many failed attempts. Try again in ${LOCKOUT_DURATION_MINUTES} minutes.`
            }),
            { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        return new Response(
          JSON.stringify({ 
            locked: false, 
            attempts_remaining: MAX_FAILED_ATTEMPTS - failedCount,
            failed_attempts: failedCount
          }),
          { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      case 'record_success': {
        // Record successful login
        await supabase.from('login_attempts').insert({
          email: normalizedEmail,
          ip_address: ip_address || null,
          success: true
        });

        // Clear any existing lockout
        await supabase
          .from('account_lockouts')
          .delete()
          .eq('email', normalizedEmail);

        return new Response(
          JSON.stringify({ success: true }),
          { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      default:
        return new Response(
          JSON.stringify({ error: "Invalid action" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
    }
  } catch (error) {
    console.error("Account lockout error:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

async function sendLockoutNotification(email: string, apiKey: string) {
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: "bnft. Security <security@resend.dev>",
      to: [email],
      subject: "Security Alert: Account Temporarily Locked",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #dc2626;">Security Alert</h2>
          <p>We detected multiple failed login attempts on your bnft. account.</p>
          <p>For your security, we've temporarily locked your account for ${LOCKOUT_DURATION_MINUTES} minutes.</p>
          <p>If this was you, you can try again after the lockout period expires.</p>
          <p>If this wasn't you, we recommend:</p>
          <ul>
            <li>Changing your password immediately once you regain access</li>
            <li>Enabling two-factor authentication</li>
            <li>Reviewing your recent account activity</li>
          </ul>
          <p style="color: #666; font-size: 12px; margin-top: 20px;">
            This is an automated security notification from bnft.
          </p>
        </div>
      `,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to send email: ${errorText}`);
  }
}
