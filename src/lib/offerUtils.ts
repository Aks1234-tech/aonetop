import { supabase } from '@/lib/supabase';

/**
 * Record offer usage when an order is placed
 * This should be called after successful order creation
 */
export async function recordOfferUsageOnOrderCreation(
  offerId: string,
  userId: string,
  orderId: string
): Promise<void> {
  try {
    const { error } = await supabase
      .from('offer_usage')
      .insert({
        offer_id: offerId,
        user_id: userId,
        order_id: orderId,
      } as any);

    if (error) {
      console.error('Error recording offer usage:', error);
      throw error;
    }
  } catch (err) {
    console.error('Failed to record offer usage:', err);
    // Don't throw - we don't want to fail the order if usage tracking fails
  }
}

/**
 * Increment the global usage count of an offer
 * This should be called after successful order creation
 */
export async function incrementOfferUsageCount(offerId: string): Promise<void> {
  try {
    // Get current count
    const { data: offer, error: fetchError } = await supabase
      .from('offers')
      .select('used_count')
      .eq('id', offerId)
      .single();

    if (fetchError) throw fetchError;

    const currentCount = (offer?.used_count as number) || 0;

    // Update count
    const { error: updateError } = await supabase
      .from('offers')
      .update({ used_count: currentCount + 1 })
      .eq('id', offerId);

    if (updateError) {
      console.error('Error incrementing offer usage:', updateError);
      throw updateError;
    }
  } catch (err) {
    console.error('Failed to increment offer usage count:', err);
    // Don't throw - we don't want to fail the order if usage tracking fails
  }
}
