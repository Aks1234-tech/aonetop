import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Package,
  Clock,
  MapPin,
  CreditCard,
  Truck,
  CheckCircle,
  AlertTriangle,
  Loader2,
  FileDown,
  Banknote,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useOrder } from '@/hooks/useOrders';
import { useAuth } from '@/contexts/AuthContext';
import { generateInvoicePDF } from '@/lib/generateInvoicePDF';

const OrderDetails = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();
  const { user, isLoading: authLoading } = useAuth();
  const { data: order, isLoading, error } = useOrder(orderId || '');

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'shipped':
        return 'bg-blue-100 text-blue-800';
      case 'confirmed':
        return 'bg-purple-100 text-purple-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'delivered':
        return CheckCircle;
      case 'shipped':
        return Truck;
      case 'confirmed':
        return Package;
      case 'cancelled':
        return AlertTriangle;
      default:
        return Clock;
    }
  };

  const getPaymentInfo = (orderData: any) => {
    const gateway = orderData.payment_gateway || 'cod';
    const status = orderData.payment_status || 'pending';

    if (gateway === 'cod') {
      return {
        label: 'Cash on Delivery',
        icon: Banknote,
        color: 'text-muted-foreground',
        bgColor: 'bg-muted/20',
      };
    }

    // Online payment
    if (status === 'completed') {
      return {
        label: 'Paid Online',
        icon: CheckCircle,
        color: 'text-green-600',
        bgColor: 'bg-green-50',
      };
    } else if (status === 'failed') {
      return {
        label: 'Payment Failed',
        icon: AlertTriangle,
        color: 'text-red-600',
        bgColor: 'bg-red-50',
      };
    } else {
      return {
        label: 'Payment Pending',
        icon: CreditCard,
        color: 'text-yellow-600',
        bgColor: 'bg-yellow-50',
      };
    }
  };

  // Auth loading
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Not authenticated
  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center py-20">
        <div className="text-center">
          <Package className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h1 className="font-display text-2xl font-semibold text-foreground mb-4">
            Sign in to view order details
          </h1>
          <Button variant="gold" asChild>
            <Link to="/login">Sign In</Link>
          </Button>
        </div>
      </div>
    );
  }

  // Loading order
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Error or order not found
  if (error || !order) {
    return (
      <div className="min-h-screen bg-background">
        <div className="bg-muted/50 py-8">
          <div className="container mx-auto px-4">
            <Button
              variant="ghost"
              onClick={() => navigate('/orders')}
              className="gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Orders
            </Button>
          </div>
        </div>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <AlertTriangle className="h-16 w-16 text-destructive mx-auto mb-4" />
            <h1 className="font-display text-2xl font-semibold text-foreground mb-2">
              Order not found
            </h1>
            <p className="text-muted-foreground mb-8">
              {error ? 'An error occurred while loading the order.' : 'This order does not exist or you do not have access to it.'}
            </p>
            <Button variant="gold" asChild>
              <Link to="/orders">View All Orders</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Check authorization - user can only view their own orders
  if (order.user_id !== user.id) {
    return (
      <div className="min-h-screen bg-background">
        <div className="bg-muted/50 py-8">
          <div className="container mx-auto px-4">
            <Button
              variant="ghost"
              onClick={() => navigate('/orders')}
              className="gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Orders
            </Button>
          </div>
        </div>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <AlertTriangle className="h-16 w-16 text-destructive mx-auto mb-4" />
            <h1 className="font-display text-2xl font-semibold text-foreground mb-2">
              Access Denied
            </h1>
            <p className="text-muted-foreground mb-8">
              You do not have permission to view this order.
            </p>
            <Button variant="gold" asChild>
              <Link to="/orders">View Your Orders</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const StatusIcon = getStatusIcon(order.status);
  const paymentInfo = getPaymentInfo(order);
  const PaymentIcon = paymentInfo.icon;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-muted/50 py-8">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <Button
            variant="ghost"
            onClick={() => navigate('/orders')}
            className="gap-2 mb-4"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Orders
          </Button>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="font-display text-4xl font-semibold text-foreground mb-2">
                Order {order.order_number}
              </h1>
              <p className="text-muted-foreground">
                Placed on {formatDate(order.created_at)}
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => generateInvoicePDF(order)}
                className="gap-2"
              >
                <FileDown className="h-4 w-4" />
                Download Invoice
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Order Status */}
            <div className="bg-card rounded-2xl p-6 shadow-soft">
              <h2 className="font-display text-xl font-semibold text-foreground mb-4">
                Order Status
              </h2>
              <div className="flex items-center gap-4">
                <div
                  className={`p-3 rounded-full ${paymentInfo.bgColor}`}
                >
                  <StatusIcon className={`h-6 w-6 ${
                    order.status === 'delivered' ? 'text-green-600' :
                    order.status === 'shipped' ? 'text-blue-600' :
                    order.status === 'confirmed' ? 'text-purple-600' :
                    order.status === 'cancelled' ? 'text-red-600' :
                    'text-yellow-600'
                  }`} />
                </div>
                <div>
                  <p className={`text-sm font-medium capitalize ${getStatusColor(order.status)}`}>
                    {order.status}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {order.status === 'delivered' && 'Your order has been delivered'}
                    {order.status === 'shipped' && 'Your order is on the way'}
                    {order.status === 'confirmed' && 'Your order has been confirmed'}
                    {order.status === 'pending' && 'Your order is being processed'}
                    {order.status === 'cancelled' && 'Your order has been cancelled'}
                  </p>
                </div>
              </div>
            </div>

            {/* Order Items */}
            <div className="bg-card rounded-2xl p-6 shadow-soft">
              <h2 className="font-display text-xl font-semibold text-foreground mb-4">
                Order Items
              </h2>
              <div className="space-y-4">
                {order.items && order.items.length > 0 ? (
                  order.items.map((item) => (
                    <div
                      key={item.id}
                      className="flex gap-4 pb-4 border-b border-border last:border-0 last:pb-0"
                    >
                      {/* Product Image */}
                      <div className="w-20 h-20 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                        {item.product_image ? (
                          <img
                            src={item.product_image}
                            alt={item.product_name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Package className="h-8 w-8 text-muted-foreground" />
                          </div>
                        )}
                      </div>
                      {/* Product Info */}
                      <div className="flex-1">
                        <h3 className="font-semibold text-foreground">
                          {item.product_name}
                        </h3>
                        <p className="text-sm text-muted-foreground mt-1">
                          SKU: {item.product_id}
                        </p>
                        <div className="flex items-center gap-4 mt-2">
                          <span className="text-sm">Quantity: {item.quantity}</span>
                          <span className="text-sm">
                            Unit Price: {formatPrice(item.price)}
                          </span>
                        </div>
                      </div>
                      {/* Item Total */}
                      <div className="text-right flex-shrink-0">
                        <p className="font-semibold text-foreground">
                          {formatPrice(item.price * item.quantity)}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {item.quantity} × {formatPrice(item.price)}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-muted-foreground text-center py-8">
                    No items in this order
                  </p>
                )}
              </div>
            </div>

            {/* Shipping Address */}
            <div className="bg-card rounded-2xl p-6 shadow-soft">
              <h2 className="font-display text-xl font-semibold text-foreground mb-4">
                Shipping Address
              </h2>
              <div className="flex gap-3">
                <MapPin className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                <div className="text-sm text-foreground">
                  <p className="font-medium">{order.shipping_name}</p>
                  <p className="text-muted-foreground mt-1">
                    {order.shipping_address}
                  </p>
                  <p className="text-muted-foreground">
                    {order.shipping_city}, {order.shipping_state}{' '}
                    {order.shipping_pincode}
                  </p>
                  <p className="text-muted-foreground mt-2">
                    Phone: {order.shipping_phone}
                  </p>
                  <p className="text-muted-foreground">
                    Email: {order.shipping_email}
                  </p>
                </div>
              </div>
            </div>

            {/* Notes */}
            {order.notes && (
              <div className="bg-card rounded-2xl p-6 shadow-soft">
                <h2 className="font-display text-xl font-semibold text-foreground mb-4">
                  Order Notes
                </h2>
                <p className="text-sm text-foreground">{order.notes}</p>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Payment Information */}
            <div className={`rounded-2xl p-6 shadow-soft ${paymentInfo.bgColor}`}>
              <h3 className="font-display font-semibold text-foreground mb-4">
                Payment Information
              </h3>
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <PaymentIcon className={`h-5 w-5 ${paymentInfo.color}`} />
                  <span className={`text-sm ${paymentInfo.color}`}>
                    {paymentInfo.label}
                  </span>
                </div>
                {order.payment_gateway === 'razorpay' && (
                  <>
                    <div className="text-sm">
                      <p className="text-muted-foreground">Status:</p>
                      <p className="font-medium capitalize">
                        {order.payment_status || 'Pending'}
                      </p>
                    </div>
                    {order.razorpay_payment_id && (
                      <div className="text-sm">
                        <p className="text-muted-foreground">Payment ID:</p>
                        <p className="font-mono text-xs break-all">
                          {order.razorpay_payment_id}
                        </p>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>

            {/* Order Summary */}
            <div className="bg-card rounded-2xl p-6 shadow-soft">
              <h3 className="font-display font-semibold text-foreground mb-4">
                Order Summary
              </h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="font-medium">
                    {formatPrice(order.subtotal)}
                  </span>
                </div>
                {order.discount_amount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Discount</span>
                    <span className="font-medium">
                      -{formatPrice(order.discount_amount)}
                    </span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Shipping</span>
                  <span className="font-medium">
                    {order.shipping_cost === 0 ? (
                      <span className="text-primary">Free</span>
                    ) : (
                      formatPrice(order.shipping_cost)
                    )}
                  </span>
                </div>
                <div className="border-t border-border pt-3 flex justify-between">
                  <span className="font-semibold text-foreground">Total</span>
                  <span className="font-display text-lg font-bold text-primary">
                    {formatPrice(order.total)}
                  </span>
                </div>
              </div>
            </div>

            {/* Order Info */}
            <div className="bg-muted/50 rounded-2xl p-6">
              <div className="space-y-3 text-sm">
                <div>
                  <p className="text-muted-foreground">Order Number</p>
                  <p className="font-mono font-semibold text-foreground">
                    {order.order_number}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Order Date</p>
                  <p className="font-medium text-foreground">
                    {formatDate(order.created_at)}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Items</p>
                  <p className="font-medium text-foreground">
                    {order.items?.length || 0} item(s)
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetails;
