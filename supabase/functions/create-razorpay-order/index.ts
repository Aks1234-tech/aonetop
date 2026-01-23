// Supabase Edge Function: Create Razorpay Order
// This function creates a Razorpay order and updates the database

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-auth",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

// Idempotency check - ensure we don't create duplicate Razorpay orders
async function checkExistingRazorpayOrder(
  supabase: any,
  orderId: string
): Promise<string | null> {
  const { data, error } = await supabase
    .from('orders')
    .select('razorpay_order_id, payment_status')
    .eq('id', orderId)
    .single();

  if (error) {
    console.error('Error checking existing order:', error);
    return null;
  }

  // If already has a Razorpay order ID and payment is initiated/completed, return it
  if (data?.razorpay_order_id && ['initiated', 'completed', 'captured'].includes(data?.payment_status)) {
    return data.razorpay_order_id;
  }

  return null;
}

interface RazorpayOrder {
  id: string;
  amount: number;
  currency: string;
  receipt: string;
  status: string;
}

serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  try {
    const { orderId, amount } = await req.json();

    if (!orderId || !amount) {
      throw new Error('Missing required fields: orderId and amount');
    }

    // Initialize Supabase once
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Check if we already created a Razorpay order for this order (idempotency)
    const existingRazorpayOrderId = await checkExistingRazorpayOrder(supabase, orderId);
    if (existingRazorpayOrderId) {
      console.log('Returning existing Razorpay order:', existingRazorpayOrderId);
      return new Response(
        JSON.stringify({
          id: existingRazorpayOrderId,
          amount: amount,
          currency: 'INR',
          idempotent: true,
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      );
    }

    const razorpayKeyId = Deno.env.get('RAZORPAY_KEY_ID');
    const razorpayKeySecret = Deno.env.get('RAZORPAY_KEY_SECRET');

    if (!razorpayKeyId || !razorpayKeySecret) {
      throw new Error('Razorpay credentials not configured');
    }

    // Create Razorpay order using their REST API
    const razorpayResponse = await fetch('https://api.razorpay.com/v1/orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Basic ' + btoa(`${razorpayKeyId}:${razorpayKeySecret}`),
      },
      body: JSON.stringify({
        amount: amount, // amount in paise
        currency: 'INR',
        receipt: orderId,
        notes: {
          order_id: orderId,
        },
      }),
    });

    if (!razorpayResponse.ok) {
      const errorData = await razorpayResponse.json();
      console.error('Razorpay API error:', errorData);
      throw new Error(errorData.error?.description || 'Failed to create Razorpay order');
    }

    const razorpayOrder: RazorpayOrder = await razorpayResponse.json();

    // Update order with Razorpay order ID (supabase already initialized above)
    const { error: updateError } = await supabase
      .from('orders')
      .update({
        razorpay_order_id: razorpayOrder.id,
        payment_status: 'initiated',
        payment_gateway: 'razorpay',
      })
      .eq('id', orderId);

    if (updateError) {
      console.error('Database update error:', updateError);
      // Don't throw - order was created, just log the error
    }

    // Log transaction
    await supabase.from('payment_transactions').insert({
      order_id: orderId,
      payment_gateway: 'razorpay',
      gateway_order_id: razorpayOrder.id,
      amount: amount,
      currency: 'INR',
      status: 'created',
    });

    return new Response(
      JSON.stringify({
        id: razorpayOrder.id,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Error creating Razorpay order:', error);
    
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Unknown error occurred' 
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});
