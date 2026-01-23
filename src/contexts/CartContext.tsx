import React, { createContext, useContext, useReducer, useEffect, ReactNode, useState } from 'react';
import { useAuth } from './AuthContext';
import { supabase, Tables } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { checkPerUserOfferUsage, validateOfferAppliesToCart } from '@/hooks/useOffers';

export interface CartItem {
  id: string; // This corresponds to product_id
  name: string;
  price: number;
  image: string;
  quantity: number;
  weight?: string;
  weightVariantId?: string; // References product_weight_variants.id
}

// Generate a unique key for cart item (product + variant combination)
function getCartItemKey(productId: string, weightVariantId?: string): string {
  return weightVariantId ? `${productId}:${weightVariantId}` : productId;
}

interface CartState {
  items: CartItem[];
  isOpen: boolean;
  appliedOffer: Tables<'offers'> | null;
}

type CartAction =
  | { type: 'ADD_TO_CART'; payload: Omit<CartItem, 'quantity'> & { quantity?: number } }
  | { type: 'REMOVE_FROM_CART'; payload: { productId: string; weightVariantId?: string } }
  | { type: 'UPDATE_QUANTITY'; payload: { productId: string; weightVariantId?: string; quantity: number } }
  | { type: 'CLEAR_CART' }
  | { type: 'TOGGLE_CART' }
  | { type: 'OPEN_CART' }
  | { type: 'CLOSE_CART' }
  | { type: 'LOAD_CART'; payload: CartItem[] }
  | { type: 'SET_OFFER'; payload: Tables<'offers'> | null };

interface CartContextType {
  items: CartItem[];
  isOpen: boolean;
  isLoading: boolean;
  addToCart: (item: Omit<CartItem, 'quantity'> & { quantity?: number }) => Promise<void>;
  removeFromCart: (productId: string, weightVariantId?: string) => Promise<void>;
  updateQuantity: (productId: string, weightVariantId: string | undefined, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
  toggleCart: () => void;
  openCart: () => void;
  closeCart: () => void;
  cartTotal: number;
  cartCount: number;
  appliedOffer: Tables<'offers'> | null;
  applyOffer: (code: string) => Promise<boolean>;
  removeOffer: () => void;
  discount: number;
  discountPercentage: number;
  finalTotal: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const CART_STORAGE_KEY = '9planet-cart';

function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case 'ADD_TO_CART': {
      const quantity = action.payload.quantity || 1;
      const itemKey = getCartItemKey(action.payload.id, action.payload.weightVariantId);
      const existingItemIndex = state.items.findIndex(
        (item) => getCartItemKey(item.id, item.weightVariantId) === itemKey
      );

      let updatedItems;
      if (existingItemIndex > -1) {
        updatedItems = [...state.items];
        updatedItems[existingItemIndex] = {
          ...updatedItems[existingItemIndex],
          quantity: updatedItems[existingItemIndex].quantity + quantity,
        };
      } else {
        updatedItems = [...state.items, { ...action.payload, quantity }];
      }
      return { ...state, items: updatedItems, isOpen: true };
    }

    case 'REMOVE_FROM_CART': {
      const removeKey = getCartItemKey(action.payload.productId, action.payload.weightVariantId);
      return {
        ...state,
        items: state.items.filter((item) => getCartItemKey(item.id, item.weightVariantId) !== removeKey),
      };
    }

    case 'UPDATE_QUANTITY': {
      const updateKey = getCartItemKey(action.payload.productId, action.payload.weightVariantId);
      if (action.payload.quantity <= 0) {
        return {
          ...state,
          items: state.items.filter((item) => getCartItemKey(item.id, item.weightVariantId) !== updateKey),
        };
      }

      return {
        ...state,
        items: state.items.map((item) =>
          getCartItemKey(item.id, item.weightVariantId) === updateKey
            ? { ...item, quantity: action.payload.quantity }
            : item
        ),
      };
    }

    case 'CLEAR_CART':
      return { ...state, items: [], appliedOffer: null };

    case 'TOGGLE_CART':
      return { ...state, isOpen: !state.isOpen };

    case 'OPEN_CART':
      return { ...state, isOpen: true };

    case 'CLOSE_CART':
      return { ...state, isOpen: false };

    case 'LOAD_CART':
      return { ...state, items: action.payload };

    case 'SET_OFFER':
      return { ...state, appliedOffer: action.payload };

    default:
      return state;
  }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [state, dispatch] = useReducer(cartReducer, {
    items: [],
    isOpen: false,
    appliedOffer: null,
  });

  // Calculate totals
  const cartTotal = state.items.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );

  const cartCount = state.items.reduce((count, item) => count + item.quantity, 0);

  // Calculate discount based on offer
  let discount = 0;
  if (state.appliedOffer) {
    // Check if offer criteria still met
    const meetsMinOrder = !state.appliedOffer.min_order_value || cartTotal >= (state.appliedOffer.min_order_value / 100);

    if (meetsMinOrder) {
      if (state.appliedOffer.type === 'percentage') {
        const calculatedDiscount = Math.round(cartTotal * ((state.appliedOffer.value || 0) / 100));
        discount = state.appliedOffer.max_discount
          ? Math.min(calculatedDiscount, state.appliedOffer.max_discount)
          : calculatedDiscount;
      } else if (state.appliedOffer.type === 'fixed') {
        // Fixed discount is stored in paise, convert to rupees
        discount = (state.appliedOffer.value || 0) / 100;
      }
      // 'free_shipping' handled in Checkout or logic below? 
      // Usually free shipping doesn't affect item subtotal, but we expose 'discount' as item discount.
    }
  }

  // Ensure discount doesn't exceed total
  discount = Math.min(discount, cartTotal);

  // Calculate discount percentage
  const discountPercentage = cartTotal > 0 ? Math.round((discount / cartTotal) * 100) : 0;

  const finalTotal = Math.max(0, cartTotal - discount);

  // Helper to get or create cart for user
  const getOrCreateCart = async (userId: string) => {
    const { data: cart } = await (supabase
      .from('carts') as any)
      .select('id')
      .eq('user_id', userId)
      .single();

    if (cart) return cart.id;

    const { data: newCart, error } = await (supabase
      .from('carts') as any)
      .insert({ user_id: userId } as any)
      .select('id')
      .single();

    if (error) throw error;
    return (newCart as any).id;
  };

  // Sync logic
  useEffect(() => {
    let mounted = true;

    const syncCart = async () => {
      if (!user) {
        // Guest mode: Load from localStorage
        const savedCart = localStorage.getItem(CART_STORAGE_KEY);
        if (savedCart && mounted) {
          try {
            const parsedCart = JSON.parse(savedCart);
            dispatch({ type: 'LOAD_CART', payload: parsedCart });
          } catch (e) {
            console.error('Failed to parse local cart');
          }
        }
        return;
      }

      setIsLoading(true);
      try {
        const cartId = await getOrCreateCart(user.id);

        // Fetch remote items
        const { data: remoteItems, error } = await supabase
          .from('cart_items')
          .select(`
            id,
            product_id,
            quantity,
            product:products (
              name,
              price,
              weight,
              images:product_images (
                url,
                is_primary
              )
            )
          `)
          .eq('cart_id', cartId);

        if (error) throw error;

        // Check if we need to merge local items
        const savedCart = localStorage.getItem(CART_STORAGE_KEY);
        let itemsToLoad: CartItem[] = [];

        if (savedCart) {
          const localItems: CartItem[] = JSON.parse(savedCart);
          if (localItems.length > 0) {
            // Merge logic: Add local items to remote
            // Simple approach: Upsert local items to DB
            for (const item of localItems) {
              // Add remote logic...
              // For simplicity, we'll just insert/update each one
              // But wait, if remote has different quantity?
              // We'll prioritize local if just logging in? Or sum them?
              // Let's sum them if exists, or insert if not.

              // Ideally, we do this once then clear LS.
              // We need a helper for upserting item.
              const { error: upsertError } = await supabase
                .from('cart_items')
                .upsert({
                  cart_id: cartId,
                  product_id: item.id,
                  quantity: item.quantity // simplified: overwriting or we could fetch and sum
                } as any, { onConflict: 'cart_id,product_id' });

              if (upsertError) console.error('Error merging item', upsertError);
            }
            // Clear local storage after merge attempt
            localStorage.removeItem(CART_STORAGE_KEY);

            // Re-fetch
            const { data: refreshedItems } = await supabase
              .from('cart_items')
              .select(`
                id,
                product_id,
                quantity,
                product:products (
                  name,
                  price,
                  weight,
                  images:product_images (url)
                )
              `)
              .eq('cart_id', cartId);

            if (refreshedItems) {
              itemsToLoad = (refreshedItems as any[]).map(item => ({
                id: item.product_id,
                name: item.product.name,
                price: item.product.price,
                weight: item.product.weight,
                image: item.product.images?.[0]?.url || '',
                quantity: item.quantity
              }));
            }
          } else {
            // No local items, use remote
            itemsToLoad = (remoteItems as any[] || []).map(item => ({
              id: item.product_id,
              name: item.product.name,
              price: item.product.price,
              weight: item.product.weight,
              image: item.product.images?.[0]?.url || '',
              quantity: item.quantity
            }));
          }
        } else {
          // No local storage, use remote
          itemsToLoad = (remoteItems as any[] || []).map(item => ({
            id: item.product_id,
            name: item.product.name,
            price: item.product.price,
            weight: item.product.weight,
            image: item.product.images?.[0]?.url || '',
            quantity: item.quantity
          }));
        }

        if (mounted) {
          dispatch({ type: 'LOAD_CART', payload: itemsToLoad });
        }
      } catch (err) {
        console.error('Cart sync error:', err);
        toast({
          title: 'Error syncing cart',
          description: 'Could not load your shopping cart.',
          variant: 'destructive',
        });
      } finally {
        if (mounted) setIsLoading(false);
      }
    };

    syncCart();

    return () => {
      mounted = false;
    };
  }, [user, toast]);

  // Persist to localStorage for guests
  useEffect(() => {
    if (!user) {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(state.items));
    }
  }, [state.items, user]);


  // Actions
  const addToCart = async (item: Omit<CartItem, 'quantity'> & { quantity?: number }) => {
    // Optimistic update
    dispatch({ type: 'ADD_TO_CART', payload: item });

    if (user) {
      try {
        const cartId = await getOrCreateCart(user.id);
        const quantityToAdd = item.quantity || 1;

        // Build query to check for existing item with same product AND variant
        let existingQuery = (supabase.from('cart_items') as any)
          .select('quantity')
          .eq('cart_id', cartId)
          .eq('product_id', item.id);
        
        if (item.weightVariantId) {
          existingQuery = existingQuery.eq('weight_variant_id', item.weightVariantId);
        } else {
          existingQuery = existingQuery.is('weight_variant_id', null);
        }

        const { data: existing } = await existingQuery.single();

        const existingQty = ((existing as any)?.quantity || 0) as number;
        const newQuantity = existingQty + quantityToAdd;

        // Upsert with weight_variant_id
        const upsertData: any = {
          cart_id: cartId,
          product_id: item.id,
          quantity: newQuantity,
          weight_variant_id: item.weightVariantId || null,
        };

        // For upsert, we need to handle the conflict properly
        // Since cart_items has unique(cart_id, product_id), we may need to delete and insert
        // Or update the unique constraint to include weight_variant_id
        // For now, let's use delete + insert approach for simplicity
        
        let deleteQuery = supabase
          .from('cart_items')
          .delete()
          .eq('cart_id', cartId)
          .eq('product_id', item.id);
        
        if (item.weightVariantId) {
          deleteQuery = deleteQuery.eq('weight_variant_id', item.weightVariantId);
        } else {
          deleteQuery = deleteQuery.is('weight_variant_id', null);
        }
        
        await deleteQuery;
        
        await (supabase.from('cart_items') as any).insert(upsertData);

      } catch (err) {
        console.error('Error adding to remote cart:', err);
        // Revert? (Not implemented for simplicity)
      }
    }
  };

  const removeFromCart = async (productId: string, weightVariantId?: string) => {
    dispatch({ type: 'REMOVE_FROM_CART', payload: { productId, weightVariantId } });

    if (user) {
      try {
        const cartId = await getOrCreateCart(user.id);
        let query = supabase
          .from('cart_items')
          .delete()
          .eq('cart_id', cartId)
          .eq('product_id', productId);
        
        if (weightVariantId) {
          query = query.eq('weight_variant_id', weightVariantId);
        } else {
          query = query.is('weight_variant_id', null);
        }
        
        await query;
      } catch (err) {
        console.error('Error removing from remote cart:', err);
      }
    }
  };

  const updateQuantity = async (productId: string, weightVariantId: string | undefined, quantity: number) => {
    dispatch({ type: 'UPDATE_QUANTITY', payload: { productId, weightVariantId, quantity } });

    if (user) {
      try {
        const cartId = await getOrCreateCart(user.id);
        let query;
        
        if (quantity > 0) {
          query = (supabase.from('cart_items') as any)
            .update({ quantity } as any)
            .eq('cart_id', cartId)
            .eq('product_id', productId);
          
          if (weightVariantId) {
            query = query.eq('weight_variant_id', weightVariantId);
          } else {
            query = query.is('weight_variant_id', null);
          }
        } else {
          // If quantity is 0, remove (though reducer handles this too)
          query = (supabase.from('cart_items') as any)
            .delete()
            .eq('cart_id', cartId)
            .eq('product_id', productId);
          
          if (weightVariantId) {
            query = query.eq('weight_variant_id', weightVariantId);
          } else {
            query = query.is('weight_variant_id', null);
          }
        }
        
        await query;
      } catch (err) {
        console.error('Error updating remote cart:', err);
      }
    }
  };

  const clearCart = async () => {
    dispatch({ type: 'CLEAR_CART' });
    if (user) {
      try {
        const cartId = await getOrCreateCart(user.id);
        await supabase
          .from('cart_items')
          .delete()
          .eq('cart_id', cartId);
      } catch (err) {
        console.error('Error clearing remote cart:', err);
      }
    }
    // Also clear localStorage to be safe
    localStorage.removeItem(CART_STORAGE_KEY);
  };

  const toggleCart = () => dispatch({ type: 'TOGGLE_CART' });
  const openCart = () => dispatch({ type: 'OPEN_CART' });
  const closeCart = () => dispatch({ type: 'CLOSE_CART' });

  // Offers
  const applyOffer = async (code: string): Promise<boolean> => {
    try {
      const { data: offerData, error } = await supabase
        .from('offers')
        .select('*')
        .eq('code', code)
        .eq('is_active', true)
        .single();

      const offer = offerData as Tables<'offers'> | null;

      if (error || !offer) {
        toast({
          title: 'Invalid code',
          description: 'This offer code does not exist or is inactive.',
          variant: 'destructive'
        });
        return false;
      }

      // Check if offer has a discount value or is free_shipping
      if (!offer.value && offer.type !== 'free_shipping') {
        toast({
          title: 'Invalid offer',
          description: 'This offer does not have a valid discount value.',
          variant: 'destructive'
        });
        return false;
      }

      // Validate dates
      const now = new Date();
      if (offer.starts_at && new Date(offer.starts_at) > now) {
        toast({ title: 'Offer not yet active', variant: 'destructive' });
        return false;
      }
      if (offer.ends_at && new Date(offer.ends_at) < now) {
        toast({ title: 'Offer expired', variant: 'destructive' });
        return false;
      }

      // Validate total usage limit
      if (offer.usage_limit && (offer.used_count || 0) >= offer.usage_limit) {
        toast({ title: 'Offer usage limit reached', variant: 'destructive' });
        return false;
      }

      // NEW: Validate per-user usage limit
      if (user && offer.per_user_limit) {
        const hasPerUserUsageAvailable = await checkPerUserOfferUsage(offer.id, user.id, offer.per_user_limit);
        if (!hasPerUserUsageAvailable) {
          toast({
            title: 'User limit reached',
            description: 'You have already used this offer the maximum number of times.',
            variant: 'destructive'
          });
          return false;
        }
      }

      // Validate minimum order: compare paise to paise
      if (offer.min_order_value) {
        const cartPaise = Math.round(cartTotal * 100);
        if (cartPaise < offer.min_order_value) {
          const needed = (offer.min_order_value - cartPaise) / 100;
          toast({
            title: 'Minimum order requirement not met',
            description: `Add ₹${needed.toFixed(2)} more to apply this offer.`,
            variant: 'destructive'
          });
          return false;
        }
      }

      // NEW: Validate product/category restrictions
      // Fetch product details for items in cart to get their categories
      const productIds = state.items.map(item => item.id);
      
      let cartItemsForValidation = state.items.map(item => ({
        id: item.id,
        category: undefined
      }));

      if (productIds.length > 0) {
        const { data: productDetails } = await supabase
          .from('products')
          .select('id, category')
          .in('id', productIds);

        if (productDetails) {
          const productMap = new Map(productDetails.map((p: any) => [p.id, p.category]));
          cartItemsForValidation = state.items.map(item => ({
            id: item.id,
            category: productMap.get(item.id)
          }));
        }
      }

      const isApplicable = await validateOfferAppliesToCart(offer.id, offer.applies_to, cartItemsForValidation);
      if (!isApplicable) {
        toast({
          title: 'Offer not applicable',
          description: 'This offer does not apply to items in your cart.',
          variant: 'destructive'
        });
        return false;
      }

      dispatch({ type: 'SET_OFFER', payload: offer });
      toast({
        title: 'Offer applied!',
        description: `${offer.name} has been applied to your cart.`
      });
      return true;

    } catch (err) {
      console.error('Error applying offer:', err);
      toast({
        title: 'Error',
        description: 'Failed to apply offer. Please try again.',
        variant: 'destructive'
      });
      return false;
    }
  };

  const removeOffer = () => {
    dispatch({ type: 'SET_OFFER', payload: null });
  };

  return (
    <CartContext.Provider
      value={{
        items: state.items,
        isOpen: state.isOpen,
        isLoading,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        toggleCart,
        openCart,
        closeCart,
        cartTotal,
        cartCount,
        appliedOffer: state.appliedOffer,
        applyOffer,
        removeOffer,
        discount,
        discountPercentage,
        finalTotal
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
