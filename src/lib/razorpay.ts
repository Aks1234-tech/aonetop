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
 * Load Razorpay checkout script dynamically
 */
export const loadRazorpayScript = (): Promise<boolean> => {
  return new Promise((resolve) => {
    // Check if already loaded
    if (window.Razorpay) {
      resolve(true);
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

/**
 * Initialize and open Razorpay checkout modal
 */
export const initiateRazorpayPayment = async (
  options: RazorpayCheckoutOptions
): Promise<void> => {
  const loaded = await loadRazorpayScript();

  if (!loaded) {
    throw new Error('Failed to load Razorpay SDK. Please check your internet connection.');
  }

  const razorpayKeyId = import.meta.env.RAZORPAY_KEY_ID;

  if (!razorpayKeyId) {
    throw new Error('Razorpay key not configured. Please contact support.');
  }

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
      options.onSuccess(response);
    },
    modal: {
      ondismiss: () => {
        options.onDismiss?.();
      },
      escape: true,
      animation: true,
      confirm_close: true,
    },
  };

  const razorpay = new window.Razorpay(razorpayOptions);

  razorpay.on('payment.failed', (response: { error: RazorpayPaymentError }) => {
    options.onError(response.error);
  });

  razorpay.open();
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
