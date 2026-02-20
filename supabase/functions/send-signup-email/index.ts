import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { userId, email, fullName } = await req.json();

    console.log(`[send-signup-email] Received request for ${email} (userId: ${userId})`);

    // Validate input
    if (!userId || !email || !fullName) {
      console.error('[send-signup-email] Missing required fields');
      return new Response(
        JSON.stringify({
          error: "Missing required fields: userId, email, fullName",
        }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get Supabase admin client
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") || "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || ""
    );

    console.log('[send-signup-email] Invoking send-email-internal function');

    // Call the notification service via RPC
    const { data, error } = await supabaseAdmin.functions.invoke(
      "send-email-internal",
      {
        body: {
          type: "signup",
          userId,
          email,
          fullName,
        },
      }
    );

    if (error) {
      console.error('[send-signup-email] Error from send-email-internal:', error);
      throw error;
    }

    console.log('[send-signup-email] Successfully processed:', data);

    return new Response(JSON.stringify({ success: true, data }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("[send-signup-email] Error:", error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Unknown error",
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
