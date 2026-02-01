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
    const { userId, email, fullName, changedFields, ipAddress, timestamp } =
      await req.json();

    // Validate input
    if (!userId || !email || !fullName || !changedFields) {
      return new Response(
        JSON.stringify({
          error: "Missing required fields",
        }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get Supabase admin client
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") || "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || ""
    );

    // Call the notification service via RPC
    const { data, error } = await supabaseAdmin.functions.invoke(
      "send-email-internal",
      {
        body: {
          type: "profile_update",
          userId,
          email,
          fullName,
          changedFields,
          ipAddress: ipAddress || "unknown",
          timestamp: timestamp || new Date().toISOString(),
        },
      }
    );

    if (error) {
      throw error;
    }

    return new Response(JSON.stringify({ success: true, data }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("Error sending profile update email:", error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Unknown error",
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
