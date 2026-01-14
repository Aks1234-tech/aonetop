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
                    <div className="space-x-0 sm:space-x-4 sm:grid sm:grid-cols-2 sm:gap-6 lg:grid-cols-3 lg:gap-8">
                        {orders.map((order) => (
                            <Link key={order.id} to={`/order/${order.id}`}>
                                <div className="bg-card rounded-xl border border-border hover:border-primary/30 hover:shadow-elevated transition-all duration-300 overflow-hidden group cursor-pointer">
                                    {/* Top Section - Order Number, Status, Price */}
                                    <div className="p-5 sm:p-6">
                                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                                            {/* Left: Order Info */}
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-3 mb-2">
                                                    <h3 className="font-display text-lg font-semibold text-foreground group-hover:text-primary transition-colors">
                                                        {order.order_number}
                                                    </h3>
                                                    <span
                                                        className={`px-3 py-1 text-xs font-semibold rounded-full whitespace-nowrap capitalize ${getStatusColor(
                                                            order.status
                                                        )}`}
                                                    >
                                                        {order.status}
                                                    </span>
                                                </div>
                                                <div className="flex flex-wrap items-center gap-3 text-sm">
                                                    <div className="flex items-center gap-1 text-muted-foreground">
                                                        <Clock className="h-4 w-4" />
                                                        {formatDate(order.created_at)}
                                                    </div>
                                                    <div className="flex items-center gap-1 text-muted-foreground">
                                                        <Package className="h-4 w-4" />
                                                        {order.items?.length || 0} item(s)
                                                    </div>
                                                    {(() => {
                                                        const paymentInfo = getPaymentInfo(order);
                                                        const PaymentIcon = paymentInfo.icon;
                                                        return (
                                                            <div className={`flex items-center gap-1 text-xs font-medium ${paymentInfo.color}`}>
                                                                <PaymentIcon className="h-3.5 w-3.5" />
                                                                {paymentInfo.label}
                                                            </div>
                                                        );
                                                    })()}
                                                </div>
                                            </div>

                                            {/* Right: Price */}
                                            <div className="text-right sm:text-right">
                                                <p className="font-display text-2xl font-bold text-primary">
                                                    {formatPrice(order.total)}
                                                </p>
                                                <p className="text-xs text-muted-foreground mt-1">
                                                    {order.shipping_city}, {order.shipping_state}
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Product Preview Section */}
                                    {order.items && order.items.length > 0 && (
                                        <div className="bg-muted/30 border-t border-border px-5 sm:px-6 py-4 flex items-center gap-3 overflow-x-auto">
                                            <span className="text-xs font-medium text-muted-foreground whitespace-nowrap">Products:</span>
                                            <div className="flex gap-2 flex-shrink-0">
                                                {order.items.slice(0, 4).map((item) => (
                                                    <div
                                                        key={item.id}
                                                        className="relative group/img flex-shrink-0"
                                                        title={item.product_name}
                                                    >
                                                        <div className="w-12 h-12 rounded-lg overflow-hidden bg-white border border-border/50">
                                                            {item.product_image ? (
                                                                <img
                                                                    src={item.product_image}
                                                                    alt={item.product_name}
                                                                    className="w-full h-full object-cover group-hover/img:scale-110 transition-transform"
                                                                />
                                                            ) : (
                                                                <div className="w-full h-full flex items-center justify-center bg-muted">
                                                                    <Package className="h-5 w-5 text-muted-foreground" />
                                                                </div>
                                                            )}
                                                        </div>
                                                        {/* Tooltip on hover */}
                                                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-foreground text-background text-xs rounded opacity-0 group-hover/img:opacity-100 transition-opacity whitespace-nowrap z-10 pointer-events-none">
                                                            {item.product_name}
                                                        </div>
                                                    </div>
                                                ))}
                                                {order.items.length > 4 && (
                                                    <div className="w-12 h-12 rounded-lg bg-primary/10 border border-primary/30 flex items-center justify-center flex-shrink-0">
                                                        <span className="text-xs font-bold text-primary">
                                                            +{order.items.length - 4}
                                                        </span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    {/* Action Section */}
                                    <div className="bg-muted/10 border-t border-border px-5 sm:px-6 py-3 flex items-center justify-between">
                                        <div className="text-xs text-muted-foreground font-medium">
                                            Click to view order details →
                                        </div>
                                        <div className="flex gap-2">
                                            <button
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    generateInvoicePDF(order);
                                                }}
                                                className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-foreground bg-background border border-border rounded-lg hover:bg-muted hover:border-primary/50 transition-colors"
                                            >
                                                <FileDown className="h-4 w-4" />
                                                <span className="hidden sm:inline">Invoice</span>
                                            </button>
                                            {/* <div className="text-primary group-hover:text-primary/80 transition-colors">
                                                <ChevronRight className="h-5 w-5" />
                                            </div> */}
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default OrderHistory;
