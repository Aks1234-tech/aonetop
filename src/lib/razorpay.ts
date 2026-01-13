// Razorpay Payment Integration for Aonetop
// Documentation: https://razorpay.com/docs/payments/payment-gateway/web-integration/standard/

declare global {
  interface Window {
    Razorpay: RazorpayConstructor;
  }
}

interface RazorpayConstructor {
  new (options: RazorpayInternalOptions): RazorpayInstance;
}

interface RazorpayInstance {
  open: () => void;
  close: () => void;
  on: (event: string, handler: (response: { error: RazorpayPaymentError }) => void) => void;
}

interface RazorpayInternalOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  image?: string;
  order_id: string;
  prefill: {
    name: string;
    email: string;
    contact: string;
  };
  notes: Record<string, string>;
  theme: {
    color: string;
    backdrop_color?: string;
  };
  handler: (response: RazorpayPaymentSuccess) => void;
  modal: {
    ondismiss: () => void;
    escape: boolean;
    animation: boolean;
    confirm_close: boolean;
  };
}

export interface RazorpayOrderResponse {
  id: string;
  amount: number;
  currency: string;
  receipt: string;
  status: string;
}

export interface RazorpayPaymentSuccess {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}

export interface RazorpayPaymentError {
  code: string;
  description: string;
  source: string;
  step: string;
  reason: string;
  metadata: {
    order_id: string;
    payment_id?: string;
  };
}

export interface RazorpayCheckoutOptions {
  orderId: string;
  amount: number; // in paise
  currency?: string;
  name?: string;
  description?: string;
  image?: string;
  prefill?: {
    name?: string;
    email?: string;
    contact?: string;
  };
  notes?: Record<string, string>;
  theme?: {
    color?: string;
    backdrop_color?: string;
  };
  onSuccess: (response: RazorpayPaymentSuccess) => void;
  onError: (error: RazorpayPaymentError) => void;
  onDismiss?: () => void;
}

/**
 * Load Razorpay checkout script dynamically with error logging
 */
export const loadRazorpayScript = (): Promise<boolean> => {
  return new Promise((resolve) => {
    // Check if already loaded
    if (window.Razorpay) {
      console.log('[Razorpay] SDK already loaded');
      resolve(true);
      return;
    }

    console.log('[Razorpay] Loading checkout script...');
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    
    script.onload = () => {
      console.log('[Razorpay] Script loaded successfully');
      resolve(true);
    };
    
    script.onerror = (error) => {
      console.error('[Razorpay] Failed to load script from CDN:', error);
      console.error('[Razorpay] Please check: network connection, CDN availability, CORS settings');
      resolve(false);
    };
    
    document.body.appendChild(script);
  });
};

/**
 * Initialize and open Razorpay checkout modal with comprehensive error handling
 */
export const initiateRazorpayPayment = async (
  options: RazorpayCheckoutOptions
): Promise<void> => {
  try {
    console.log('[Razorpay] Initiating payment flow...');
    const loaded = await loadRazorpayScript();

    if (!loaded) {
      throw new Error('Failed to load Razorpay SDK. This could be due to: network issues, CDN being blocked, or CORS restrictions. Please check your connection and try again.');
    }

    const razorpayKeyId = import.meta.env.VITE_RAZORPAY_KEY_ID;
    console.log('[Razorpay] Key ID present:', !!razorpayKeyId);
    console.log('[Razorpay] Key ID length:', razorpayKeyId?.length);

    if (!razorpayKeyId) {
      throw new Error('Razorpay key not configured. Please contact support.');
    }

    // Validate key format
    if (!razorpayKeyId.startsWith('rzp_test_') && !razorpayKeyId.startsWith('rzp_live_')) {
      console.error('[Razorpay] Invalid key format:', razorpayKeyId);
      throw new Error('Invalid Razorpay key format. Key should start with rzp_test_ or rzp_live_');
    }

    if (razorpayKeyId.length < 35) {
      console.error('[Razorpay] Key appears truncated. Expected 35+ chars, got:', razorpayKeyId.length);
      throw new Error('Razorpay key appears to be incomplete. Please verify your API key configuration.');
    }

    console.log('[Razorpay] Key validation passed');

    const razorpayOptions: RazorpayInternalOptions = {
      key: razorpayKeyId,
      amount: options.amount,
      currency: options.currency || 'INR',
      name: options.name || 'Aonetop',
      description: options.description || 'Order Payment',
      image: options.image || '/logo.png',
      order_id: options.orderId,
      prefill: {
        name: options.prefill?.name || '',
        email: options.prefill?.email || '',
        contact: options.prefill?.contact || '',
      },
      notes: options.notes || {},
      theme: {
        color: options.theme?.color || '#8B7355', // Brand gold color
        backdrop_color: options.theme?.backdrop_color || 'rgba(0, 0, 0, 0.5)',
      },
      handler: (response: RazorpayPaymentSuccess) => {
        console.log('[Razorpay] Payment successful, razorpay_order_id:', response.razorpay_order_id);
        options.onSuccess(response);
      },
      modal: {
        ondismiss: () => {
          console.log('[Razorpay] Payment modal dismissed');
          options.onDismiss?.();
        },
        escape: true,
        animation: true,
        confirm_close: true,
      },
    };

    console.log('[Razorpay] Initializing Razorpay SDK with options:', {
      amount: razorpayOptions.amount,
      currency: razorpayOptions.currency,
      order_id: razorpayOptions.order_id,
    });

    const razorpay = new window.Razorpay(razorpayOptions);
    console.log('[Razorpay] SDK instance created successfully');

    razorpay.on('payment.failed', (response: { error: RazorpayPaymentError }) => {
      console.error('[Razorpay] Payment failed:', response.error);
      options.onError(response.error);
    });

    console.log('[Razorpay] Opening checkout modal...');
    razorpay.open();
  } catch (error) {
    console.error('[Razorpay] Error in initiateRazorpayPayment:', error);
    throw error;
  }
};

/**
 * Payment method configuration
 */
export const PAYMENT_METHODS = {
  cod: {
    id: 'cod',
    label: 'Cash on Delivery',
    description: 'Pay when your order arrives at your doorstep',
    icon: 'Truck',
  },
  online: {
    id: 'online',
    label: 'Pay Online',
    description: 'UPI, Credit/Debit Card, Net Banking, Wallets',
    icon: 'CreditCard',
  },
} as const;

export type PaymentMethodType = keyof typeof PAYMENT_METHODS;

/**
 * Format error message for display
 */
export const formatRazorpayError = (error: RazorpayPaymentError): string => {
  const errorMessages: Record<string, string> = {
    BAD_REQUEST_ERROR: 'Invalid payment request. Please try again.',
    GATEWAY_ERROR: 'Payment gateway error. Please try again later.',
    SERVER_ERROR: 'Server error. Please try again later.',
    NETWORK_ERROR: 'Network error. Please check your connection.',
  };

  return errorMessages[error.code] || error.description || 'Payment failed. Please try again.';
};
