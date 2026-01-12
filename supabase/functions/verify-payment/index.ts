// Supabase Edge Function: Verify Razorpay Payment
// This function verifies the payment signature and updates the order status

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { createHmac } from 'https://deno.land/std@0.168.0/node/crypto.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { 
      orderId, 
      razorpay_order_id, 
      razorpay_payment_id, 
      razorpay_signature 
    } = await req.json();

    if (!orderId || !razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      throw new Error('Missing required payment verification fields');
    }

    const razorpayKeySecret = Deno.env.get('RAZORPAY_KEY_SECRET');

    if (!razorpayKeySecret) {
      throw new Error('Razorpay secret not configured');
    }

    // Verify signature
    // Razorpay signature = HMAC-SHA256(razorpay_order_id + "|" + razorpay_payment_id, secret)
    const body = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSignature = createHmac('sha256', razorpayKeySecret)
      .update(body)
      .digest('hex');

    if (expectedSignature !== razorpay_signature) {
      console.error('Signature mismatch:', { expected: expectedSignature, received: razorpay_signature });
      throw new Error('Invalid payment signature - possible tampering detected');
    }

    // Signature verified - update order
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get order details for transaction logging
    const { data: order } = await supabase
      .from('orders')
      .select('total')
      .eq('id', orderId)
      .single();

    // Update order with payment details
    const { error: updateError } = await supabase
      .from('orders')
      .update({
        razorpay_payment_id,
        razorpay_signature,
        payment_status: 'completed',
        paid_at: new Date().toISOString(),
        status: 'confirmed', // Auto-confirm paid orders
      })
      .eq('id', orderId);

    if (updateError) {
      console.error('Failed to update order:', updateError);
      throw new Error('Failed to update order status');
    }

    // Log successful transaction
    await supabase.from('payment_transactions').insert({
      order_id: orderId,
      payment_gateway: 'razorpay',
      gateway_order_id: razorpay_order_id,
      gateway_payment_id: razorpay_payment_id,
      amount: order?.total || 0,
      currency: 'INR',
      status: 'captured',
    });

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Payment verified successfully',
        orderId,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Payment verification error:', error);

    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Payment verification failed' 
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});
