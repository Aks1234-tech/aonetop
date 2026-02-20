import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, CreditCard, Truck, CheckCircle, AlertCircle, Loader2, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useCart } from '@/contexts/CartContext';
import { useToast } from '@/hooks/use-toast';
import { useCreateOrder, useCreateRazorpayOrder, useVerifyPayment, useUpdatePaymentStatus } from '@/hooks/useOrders';
import { initiateRazorpayPayment, formatRazorpayError, PaymentMethodType } from '@/lib/razorpay';
import { cn } from '@/lib/utils';

const Checkout = () => {
  const { items, cartTotal, clearCart, cartCount, appliedOffer, discount, discountPercentage, finalTotal, removeOffer } = useCart();
  const navigate = useNavigate();
  const { toast } = useToast();
  const createOrder = useCreateOrder();
  const createRazorpayOrder = useCreateRazorpayOrder();
  const verifyPayment = useVerifyPayment();
  const updatePaymentStatus = useUpdatePaymentStatus();
  
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [orderNumber, setOrderNumber] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethodType>('cod');
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    notes: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
    }).format(price);
  };

  // Determine shipping cost (check for free shipping offer or threshold)
  const isFreeShipping = appliedOffer?.type === 'free_shipping' || cartTotal >= 999;
  const shippingCost = isFreeShipping ? 0 : 99;

  // orderTotal logic replaced by render-time calculation

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.firstName.trim()) newErrors.firstName = 'First name is required';
    if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    if (!/^\S+@\S+\.\S+$/.test(formData.email)) newErrors.email = 'Invalid email address';
    if (!formData.phone.trim()) newErrors.phone = 'Phone is required';
    if (!/^[6-9]\d{9}$/.test(formData.phone)) newErrors.phone = 'Invalid phone number';
    if (!formData.address.trim()) newErrors.address = 'Address is required';
    if (!formData.city.trim()) newErrors.city = 'City is required';
    if (!formData.state.trim()) newErrors.state = 'State is required';
    if (!formData.pincode.trim()) newErrors.pincode = 'PIN code is required';
    if (!/^\d{6}$/.test(formData.pincode)) newErrors.pincode = 'Invalid PIN code';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast({
        title: 'Please check your details',
        description: 'Some fields have errors that need to be fixed.',
        variant: 'destructive',
      });
      return;
    }

    const orderTotal = (finalTotal + shippingCost) * 100; // Convert to paise

    try {
      // Step 1: Create order in database
      const order = await createOrder.mutateAsync({
        items: items.map((item) => ({
          productId: item.id,
          productName: item.name,
          productImage: item.image,
          quantity: item.quantity,
          price: item.price * 100, // Convert to paise
          weightVariantId: item.weightVariantId,
          weightValue: item.weight,
        })),
        shippingInfo: {
          name: `${formData.firstName} ${formData.lastName}`,
          email: formData.email,
          phone: formData.phone,
          address: formData.address,
          city: formData.city,
          state: formData.state,
          pincode: formData.pincode,
        },
        paymentMethod: paymentMethod === 'online' ? 'razorpay' : 'cod',
        paymentGateway: paymentMethod === 'online' ? 'razorpay' : 'cod',
        notes: formData.notes || undefined,
        offerId: appliedOffer?.id,
        discountAmount: discount * 100, // Convert to paise for DB
        shippingCost: shippingCost * 100, // Convert to paise
      });

      // Step 2: If online payment, initiate Razorpay
      if (paymentMethod === 'online') {
        setIsProcessingPayment(true);

        try {
          console.log('[Checkout] Initiating online payment for order:', order.id);
          
          // Create Razorpay order
          console.log('[Checkout] Creating Razorpay order...');
          const razorpayOrder = await createRazorpayOrder.mutateAsync({
            orderId: order.id,
            amount: orderTotal,
          });
          
          console.log('[Checkout] Razorpay order created:', razorpayOrder.id);

          // Open Razorpay checkout
          console.log('[Checkout] Opening Razorpay checkout modal...');
          await initiateRazorpayPayment({
            orderId: razorpayOrder.id,
            amount: razorpayOrder.amount,
            currency: razorpayOrder.currency,
            name: 'Aonetop',
            description: `Order ${order.order_number}`,
            prefill: {
              name: `${formData.firstName} ${formData.lastName}`,
              email: formData.email,
              contact: formData.phone,
            },
            notes: {
              order_id: order.id,
              order_number: order.order_number || '',
            },
            onSuccess: async (response) => {
              try {
                console.log('[Checkout] Payment success, verifying signature...');
                // Verify payment on server
                await verifyPayment.mutateAsync({
                  orderId: order.id,
                  razorpay_order_id: response.razorpay_order_id,
                  razorpay_payment_id: response.razorpay_payment_id,
                  razorpay_signature: response.razorpay_signature,
                });

                console.log('[Checkout] Payment verified successfully');
                setOrderPlaced(true);
                setOrderNumber(order.order_number);
                clearCart();
                removeOffer();

                toast({
                  title: 'Payment successful!',
                  description: `Order ${order.order_number} confirmed. Thank you for your purchase!`,
                });
              } catch (verifyError) {
                console.error('[Checkout] Payment verification failed:', verifyError);
                toast({
                  title: 'Payment verification failed',
                  description: 'Please contact support with your order number.',
                  variant: 'destructive',
                });
              } finally {
                setIsProcessingPayment(false);
              }
            },
            onError: async (error) => {
              console.error('[Checkout] Payment error occurred:', error);
              setIsProcessingPayment(false);
              
              // Update order payment status to failed
              await updatePaymentStatus.mutateAsync({
                orderId: order.id,
                paymentStatus: 'failed',
                errorMessage: formatRazorpayError(error),
              });

              toast({
                title: 'Payment failed',
                description: formatRazorpayError(error),
                variant: 'destructive',
              });
            },
            onDismiss: () => {
              console.log('[Checkout] Payment modal dismissed by user');
              setIsProcessingPayment(false);
              toast({
                title: 'Payment cancelled',
                description: 'You can retry the payment or choose Cash on Delivery.',
              });
            },
          });
        } catch (razorpayError) {
          console.error('[Checkout] Razorpay payment initialization error:', razorpayError);
          setIsProcessingPayment(false);
          toast({
            title: 'Payment initialization failed',
            description: razorpayError instanceof Error ? razorpayError.message : 'Unable to start payment. Please try again.',
            variant: 'destructive',
          });
        }
      } else {
        // COD flow - order is complete
        console.log('[Checkout] COD payment selected, order complete');
        setOrderPlaced(true);
        setOrderNumber(order.order_number);
        clearCart();
        removeOffer();

        toast({
          title: 'Order placed successfully!',
          description: `Order ${order.order_number} - You will receive a confirmation email shortly.`,
        });
      }
    } catch (error) {
      console.error('[Checkout] Order submission error:', error);
      toast({
        title: 'Order failed',
        description: error instanceof Error ? error.message : 'There was an error processing your order. Please try again.',
        variant: 'destructive',
      });
    }
  };

  if (items.length === 0 && !orderPlaced) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center py-20">
        <div className="text-center">
          <h1 className="font-display text-3xl font-semibold text-foreground mb-4">
            Your cart is empty
          </h1>
          <p className="text-muted-foreground mb-8">
            Add some teas to your cart before checking out.
          </p>
          <Button variant="gold" asChild>
            <Link to="/shop">Browse Teas</Link>
          </Button>
        </div>
      </div>
    );
  }

  if (orderPlaced) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center py-20">
        <div className="text-center max-w-md">
          <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="h-10 w-10 text-primary" />
          </div>
          <h1 className="font-display text-3xl font-semibold text-foreground mb-4">
            Order Confirmed!
          </h1>
          <p className="text-muted-foreground mb-8">
            Thank you for your order. We've sent a confirmation email with your order details.
            Your teas will be shipped soon!
          </p>
          <Button variant="gold" asChild>
            <Link to="/shop">Continue Shopping</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-12">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <Link
          to="/cart"
          className="inline-flex items-center text-muted-foreground hover:text-foreground transition-colors mb-8"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Cart
        </Link>

        <h1 className="font-display text-3xl sm:text-4xl font-semibold text-foreground mb-8">
          Checkout
        </h1>

        <form onSubmit={handleSubmit}>
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Form */}
            <div className="lg:col-span-2 space-y-8">
              {/* Contact Information */}
              <div className="bg-card rounded-2xl p-6 shadow-soft">
                <h2 className="font-display text-xl font-semibold text-foreground mb-6">
                  Contact Information
                </h2>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="firstName">First Name *</Label>
                    <Input
                      id="firstName"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleChange}
                      className={errors.firstName ? 'border-destructive' : ''}
                    />
                    {errors.firstName && (
                      <p className="text-sm text-destructive mt-1">{errors.firstName}</p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="lastName">Last Name *</Label>
                    <Input
                      id="lastName"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleChange}
                      className={errors.lastName ? 'border-destructive' : ''}
                    />
                    {errors.lastName && (
                      <p className="text-sm text-destructive mt-1">{errors.lastName}</p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      className={errors.email ? 'border-destructive' : ''}
                    />
                    {errors.email && (
                      <p className="text-sm text-destructive mt-1">{errors.email}</p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="phone">Phone *</Label>
                    <Input
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="9876543210"
                      className={errors.phone ? 'border-destructive' : ''}
                    />
                    {errors.phone && (
                      <p className="text-sm text-destructive mt-1">{errors.phone}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Shipping Address */}
              <div className="bg-card rounded-2xl p-6 shadow-soft">
                <h2 className="font-display text-xl font-semibold text-foreground mb-6">
                  Shipping Address
                </h2>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="address">Address *</Label>
                    <Input
                      id="address"
                      name="address"
                      value={formData.address}
                      onChange={handleChange}
                      placeholder="House no, Building, Street, Area"
                      className={errors.address ? 'border-destructive' : ''}
                    />
                    {errors.address && (
                      <p className="text-sm text-destructive mt-1">{errors.address}</p>
                    )}
                  </div>
                  <div className="grid sm:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="city">City *</Label>
                      <Input
                        id="city"
                        name="city"
                        value={formData.city}
                        onChange={handleChange}
                        className={errors.city ? 'border-destructive' : ''}
                      />
                      {errors.city && (
                        <p className="text-sm text-destructive mt-1">{errors.city}</p>
                      )}
                    </div>
                    <div>
                      <Label htmlFor="state">State *</Label>
                      <Input
                        id="state"
                        name="state"
                        value={formData.state}
                        onChange={handleChange}
                        className={errors.state ? 'border-destructive' : ''}
                      />
                      {errors.state && (
                        <p className="text-sm text-destructive mt-1">{errors.state}</p>
                      )}
                    </div>
                    <div>
                      <Label htmlFor="pincode">PIN Code *</Label>
                      <Input
                        id="pincode"
                        name="pincode"
                        value={formData.pincode}
                        onChange={handleChange}
                        placeholder="123456"
                        className={errors.pincode ? 'border-destructive' : ''}
                      />
                      {errors.pincode && (
                        <p className="text-sm text-destructive mt-1">{errors.pincode}</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Payment Method */}
              <div className="bg-card rounded-2xl p-6 shadow-soft">
                <h2 className="font-display text-xl font-semibold text-foreground mb-6">
                  Payment Method
                </h2>
                <div className="space-y-3">
                  {/* Cash on Delivery Option */}
                  <label
                    className={cn(
                      "flex items-start gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all",
                      paymentMethod === 'cod'
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/50"
                    )}
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="cod"
                      checked={paymentMethod === 'cod'}
                      onChange={() => setPaymentMethod('cod')}
                      className="sr-only"
                    />
                    <div className={cn(
                      "w-5 h-5 rounded-full border-2 flex items-center justify-center mt-0.5 shrink-0",
                      paymentMethod === 'cod' ? "border-primary" : "border-muted-foreground"
                    )}>
                      {paymentMethod === 'cod' && (
                        <div className="w-2.5 h-2.5 rounded-full bg-primary" />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <Truck className="h-5 w-5 text-primary" />
                        <span className="font-semibold text-foreground">Cash on Delivery</span>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        Pay when your order arrives at your doorstep
                      </p>
                    </div>
                  </label>

                  {/* Online Payment Option */}
                  <label
                    className={cn(
                      "flex items-start gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all",
                      paymentMethod === 'online'
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/50"
                    )}
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="online"
                      checked={paymentMethod === 'online'}
                      onChange={() => setPaymentMethod('online')}
                      className="sr-only"
                    />
                    <div className={cn(
                      "w-5 h-5 rounded-full border-2 flex items-center justify-center mt-0.5 shrink-0",
                      paymentMethod === 'online' ? "border-primary" : "border-muted-foreground"
                    )}>
                      {paymentMethod === 'online' && (
                        <div className="w-2.5 h-2.5 rounded-full bg-primary" />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <CreditCard className="h-5 w-5 text-primary" />
                        <span className="font-semibold text-foreground">Pay Online</span>
                        <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">
                          Secure
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        UPI, Credit/Debit Card, Net Banking, Wallets
                      </p>
                      <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                        <span className="bg-muted px-2 py-1 rounded">UPI</span>
                        <span className="bg-muted px-2 py-1 rounded">Cards</span>
                        <span className="bg-muted px-2 py-1 rounded">NetBanking</span>
                        <span className="bg-muted px-2 py-1 rounded">Wallets</span>
                      </div>
                    </div>
                  </label>
                </div>

                {/* Security Notice */}
                <div className="flex items-start gap-2 mt-4 p-3 bg-green-50 rounded-lg text-sm text-green-700">
                  <Shield className="h-4 w-4 mt-0.5 shrink-0" />
                  <p>Your payment information is encrypted and secure. Powered by Razorpay.</p>
                </div>
              </div>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-card rounded-2xl p-6 shadow-soft sticky top-24">
                <h2 className="font-display text-xl font-semibold text-foreground mb-6">
                  Order Summary
                </h2>

                {/* Items */}
                <div className="space-y-4 mb-6 max-h-60 overflow-y-auto">
                  {items.map((item) => (
                    <div key={item.id} className="flex gap-3">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-16 h-16 object-cover rounded-lg"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-foreground truncate">{item.name}</p>
                        <p className="text-sm text-muted-foreground">Qty: {item.quantity}</p>
                        <div className="flex justify-between items-center">
                          <p className="font-medium text-primary">{formatPrice(item.price * item.quantity)}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="space-y-3 mb-6 pt-4 border-t border-border">
                  <div className="flex justify-between text-muted-foreground">
                    <span>Subtotal</span>
                    <span>{formatPrice(cartTotal)}</span>
                  </div>

                  {discount > 0 && (
                    <div className="space-y-2">
                      <div className="flex justify-between text-green-600 font-medium">
                        <span>Discount {appliedOffer ? `(${appliedOffer.code})` : ''}</span>
                        <span>-{formatPrice(discount)}</span>
                      </div>
                      <div className="flex justify-between text-sm text-green-600 bg-green-50 p-2 rounded">
                        <span>You saved</span>
                        <span className="font-semibold">{discountPercentage}% off</span>
                      </div>
                    </div>
                  )}

                  <div className="flex justify-between text-muted-foreground">
                    <span>Shipping</span>
                    <span>
                      {shippingCost === 0 ? (
                        <span className="text-primary font-medium">Free</span>
                      ) : (
                        formatPrice(shippingCost)
                      )}
                    </span>
                  </div>

                  <div className="border-t border-border pt-3">
                    <div className="flex justify-between">
                      <span className="font-display text-lg font-semibold text-foreground">
                        Total
                      </span>
                      <span className="font-display text-2xl font-bold text-primary">
                        {formatPrice(finalTotal + shippingCost)}
                      </span>
                    </div>
                  </div>
                </div>

                <Button
                  type="submit"
                  variant="gold"
                  size="lg"
                  className="w-full"
                  disabled={createOrder.isPending || isProcessingPayment}
                >
                  {createOrder.isPending || isProcessingPayment ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      {isProcessingPayment ? 'Processing Payment...' : 'Creating Order...'}
                    </>
                  ) : paymentMethod === 'online' ? (
                    <>
                      Pay {formatPrice(finalTotal + shippingCost)}
                      <CreditCard className="ml-2 h-5 w-5" />
                    </>
                  ) : (
                    <>
                      Place Order (COD)
                      <Truck className="ml-2 h-5 w-5" />
                    </>
                  )}
                </Button>

                {paymentMethod === 'online' && (
                  <p className="text-xs text-muted-foreground text-center mt-2">
                    You will be redirected to Razorpay secure payment gateway
                  </p>
                )}

                <p className="text-xs text-muted-foreground text-center mt-4">
                  By placing this order, you agree to our Terms of Service and Privacy Policy
                </p>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Checkout;
