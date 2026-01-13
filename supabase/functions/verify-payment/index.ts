// Supabase Edge Function: Verify Razorpay Payment
// This function verifies the payment signature and updates the order status

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

// Constant-time string comparison to prevent timing attacks
function constantTimeCompare(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  
  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return result === 0;
}

// Create HMAC-SHA256 signature using Web Crypto API
async function verifyRazorpaySignature(
  razorpayOrderId: string,
  razorpayPaymentId: string,
  providedSignature: string,
  secret: string
): Promise<boolean> {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );

  const body = `${razorpayOrderId}|${razorpayPaymentId}`;
  const signatureBuffer = await crypto.subtle.sign('HMAC', key, encoder.encode(body));
  const expectedSignature = Array.from(new Uint8Array(signatureBuffer))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');

  return constantTimeCompare(expectedSignature, providedSignature);
}

serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders });
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

    // Verify signature using Web Crypto API with constant-time comparison
    const isSignatureValid = await verifyRazorpaySignature(
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      razorpayKeySecret
    );

    if (!isSignatureValid) {
      console.error('Signature mismatch - possible tampering detected');
      throw new Error('Invalid payment signature - possible tampering detected');
    }

    // Signature verified - update order
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Get order details - trust database amount, NOT frontend
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('total, payment_status')
      .eq('id', orderId)
      .single();

    if (orderError || !order) {
      console.error('Order not found:', orderError);
      throw new Error('Order not found');
    }

    // Idempotency check - if already completed, return success
    if (order.payment_status === 'completed' || order.payment_status === 'captured') {
      console.log('Payment already verified for order:', orderId);
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'Payment already verified',
          orderId,
          idempotent: true,
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      );
    }

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

    // Log successful transaction (use upsert to handle idempotency)
    await supabase.from('payment_transactions').upsert({
      order_id: orderId,
      payment_gateway: 'razorpay',
      gateway_order_id: razorpay_order_id,
      gateway_payment_id: razorpay_payment_id,
      amount: order.total,
      currency: 'INR',
      status: 'captured',
    }, {
      onConflict: 'gateway_payment_id'
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
