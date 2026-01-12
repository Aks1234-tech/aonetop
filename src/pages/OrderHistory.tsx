import { Link } from 'react-router-dom';
import { Package, Clock, ChevronRight, Loader2, FileDown, CreditCard, Banknote, CheckCircle, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useOrders } from '@/hooks/useOrders';
import { useAuth } from '@/contexts/AuthContext';
import { generateInvoicePDF } from '@/lib/generateInvoicePDF';

const OrderHistory = () => {
    const { user, isLoading: authLoading } = useAuth();
    const { data: orders = [], isLoading, error } = useOrders();

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            minimumFractionDigits: 0,
        }).format(price / 100); // Convert from paise
    };

    const formatDate = (date: string) => {
        return new Date(date).toLocaleDateString('en-IN', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
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

    const getPaymentInfo = (order: any) => {
        const gateway = order.payment_gateway || 'cod';
        const status = order.payment_status || 'pending';
        
        if (gateway === 'cod') {
            return {
                label: 'Cash on Delivery',
                icon: Banknote,
                color: 'text-muted-foreground',
            };
        }
        
        // Online payment
        if (status === 'completed') {
            return {
                label: 'Paid Online',
                icon: CheckCircle,
                color: 'text-green-600',
            };
        } else if (status === 'failed') {
            return {
                label: 'Payment Failed',
                icon: AlertTriangle,
                color: 'text-red-600',
            };
        } else {
            return {
                label: 'Payment Pending',
                icon: CreditCard,
                color: 'text-yellow-600',
            };
        }
    };

    if (authLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    if (!user) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center py-20">
                <div className="text-center">
                    <Package className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                    <h1 className="font-display text-2xl font-semibold text-foreground mb-4">
                        Sign in to view your orders
                    </h1>
                    <Button variant="gold" asChild>
                        <Link to="/login">Sign In</Link>
                    </Button>
                </div>
            </div>
        );
    }

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background">
            {/* Header */}
            <div className="bg-muted/50 py-12">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <h1 className="font-display text-4xl font-semibold text-foreground text-center mb-4">
                        Order History
                    </h1>
                    <p className="text-muted-foreground text-center max-w-xl mx-auto">
                        Track and manage your orders
                    </p>
                </div>
            </div>

            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
                {orders.length === 0 ? (
                    <div className="text-center py-16">
                        <Package className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                        <h2 className="font-display text-xl font-semibold text-foreground mb-2">
                            No orders yet
                        </h2>
                        <p className="text-muted-foreground mb-8">
                            Start shopping to see your orders here
                        </p>
                        <Button variant="gold" asChild>
                            <Link to="/shop">Browse Products</Link>
                        </Button>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {orders.map((order) => (
                            <div
                                key={order.id}
                                className="bg-card rounded-2xl p-6 shadow-soft hover:shadow-elevated transition-shadow"
                            >
                                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
                                    <div>
                                        <div className="flex items-center gap-3 flex-wrap">
                                            <h3 className="font-display text-lg font-semibold text-foreground">
                                                Order {order.order_number}
                                            </h3>
                                            <span
                                                className={`px-3 py-1 text-xs font-medium rounded-full capitalize ${getStatusColor(
                                                    order.status
                                                )}`}
                                            >
                                                {order.status}
                                            </span>
                                            {(() => {
                                                const paymentInfo = getPaymentInfo(order);
                                                const PaymentIcon = paymentInfo.icon;
                                                return (
                                                    <span className={`flex items-center gap-1 text-xs ${paymentInfo.color}`}>
                                                        <PaymentIcon className="h-3 w-3" />
                                                        {paymentInfo.label}
                                                    </span>
                                                );
                                            })()}
                                        </div>
                                        <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                                            <Clock className="h-4 w-4" />
                                            {formatDate(order.created_at)}
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-display text-xl font-semibold text-primary">
                                            {formatPrice(order.total)}
                                        </p>
                                        <p className="text-sm text-muted-foreground">
                                            {order.items?.length || 0} item(s)
                                        </p>
                                    </div>
                                </div>

                                {/* Order Items Preview */}
                                {order.items && order.items.length > 0 && (
                                    <div className="flex gap-2 flex-wrap mb-4">
                                        {order.items.slice(0, 3).map((item) => (
                                            <div
                                                key={item.id}
                                                className="w-16 h-16 rounded-lg overflow-hidden bg-muted"
                                            >
                                                {item.product_image ? (
                                                    <img
                                                        src={item.product_image}
                                                        alt={item.product_name}
                                                        className="w-full h-full object-cover"
                                                    />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center">
                                                        <Package className="h-6 w-6 text-muted-foreground" />
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                        {order.items.length > 3 && (
                                            <div className="w-16 h-16 rounded-lg bg-muted flex items-center justify-center">
                                                <span className="text-sm font-medium text-muted-foreground">
                                                    +{order.items.length - 3}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                )}

                                <div className="flex items-center justify-between pt-4 border-t border-border">
                                    <div className="text-sm text-muted-foreground">
                                        Shipping to: {order.shipping_city}, {order.shipping_state}
                                    </div>
                                    <div className="flex gap-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => generateInvoicePDF(order)}
                                            className="gap-1"
                                        >
                                            <FileDown className="h-4 w-4" />
                                            Invoice
                                        </Button>
                                        <Button variant="ghost" size="sm">
                                            View Details
                                            <ChevronRight className="ml-1 h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default OrderHistory;
