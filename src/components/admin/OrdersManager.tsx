import { useState } from 'react';
import { Eye, Loader2, Package, Truck, CheckCircle, XCircle, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useAdminOrders, useUpdateOrderStatus, Order } from '@/hooks/useOrders';

// Order status options
const ORDER_STATUSES = [
    { value: 'pending', label: 'Pending', icon: Clock, color: 'bg-yellow-100 text-yellow-700' },
    { value: 'confirmed', label: 'Confirmed', icon: CheckCircle, color: 'bg-blue-100 text-blue-700' },
    { value: 'processing', label: 'Processing', icon: Package, color: 'bg-indigo-100 text-indigo-700' },
    { value: 'shipped', label: 'Shipped', icon: Truck, color: 'bg-purple-100 text-purple-700' },
    { value: 'delivered', label: 'Delivered', icon: CheckCircle, color: 'bg-green-100 text-green-700' },
    { value: 'cancelled', label: 'Cancelled', icon: XCircle, color: 'bg-red-100 text-red-700' },
];

// Helper for currency
const formatPrice = (priceInPaise: number) => {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        minimumFractionDigits: 0,
    }).format(priceInPaise / 100);
};

// Format date
const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
};

export function OrdersManager() {
    const { data: orders, isLoading } = useAdminOrders();
    const updateStatus = useUpdateOrderStatus();
    const { toast } = useToast();

    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
    const [isDetailsOpen, setIsDetailsOpen] = useState(false);

    const getStatusInfo = (status: string) => {
        return ORDER_STATUSES.find(s => s.value === status) || ORDER_STATUSES[0];
    };

    const handleStatusChange = async (orderId: string, newStatus: string) => {
        try {
            await updateStatus.mutateAsync({ orderId, status: newStatus });
            toast({ title: `Order status updated to ${newStatus}` });
        } catch (error) {
            toast({ title: 'Failed to update order status', variant: 'destructive' });
        }
    };

    const handleViewDetails = (order: Order) => {
        setSelectedOrder(order);
        setIsDetailsOpen(true);
    };

    if (isLoading) {
        return (
            <div className="flex justify-center p-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h2 className="font-display text-lg font-semibold text-foreground">
                    Order Management
                </h2>
                <div className="text-sm text-muted-foreground">
                    {orders?.length || 0} total orders
                </div>
            </div>

            <div className="bg-card rounded-xl shadow-soft overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-border bg-muted/30">
                                <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Order #</th>
                                <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Customer</th>
                                <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Items</th>
                                <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Total</th>
                                <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Status</th>
                                <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Date</th>
                                <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {orders?.map((order) => {
                                const statusInfo = getStatusInfo(order.status);
                                return (
                                    <tr key={order.id} className="border-b border-border last:border-0 hover:bg-muted/10 transition-colors">
                                        <td className="py-3 px-4">
                                            <span className="font-mono text-sm font-medium">
                                                {order.order_number || order.id.slice(0, 8)}
                                            </span>
                                        </td>
                                        <td className="py-3 px-4">
                                            <div>
                                                <div className="font-medium text-foreground">{order.shipping_name || 'N/A'}</div>
                                                <div className="text-xs text-muted-foreground">{order.shipping_email}</div>
                                            </div>
                                        </td>
                                        <td className="py-3 px-4 text-sm">
                                            {order.items?.length || 0} items
                                        </td>
                                        <td className="py-3 px-4 font-medium">
                                            {formatPrice(order.total)}
                                        </td>
                                        <td className="py-3 px-4">
                                            <Select
                                                value={order.status}
                                                onValueChange={(value) => handleStatusChange(order.id, value)}
                                            >
                                                <SelectTrigger className={`w-32 h-8 text-xs ${statusInfo.color}`}>
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {ORDER_STATUSES.map((status) => (
                                                        <SelectItem key={status.value} value={status.value}>
                                                            <div className="flex items-center gap-2">
                                                                <status.icon className="h-3 w-3" />
                                                                {status.label}
                                                            </div>
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </td>
                                        <td className="py-3 px-4 text-sm text-muted-foreground">
                                            {formatDate(order.created_at)}
                                        </td>
                                        <td className="py-3 px-4">
                                            <div className="flex justify-end">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleViewDetails(order)}
                                                >
                                                    <Eye className="h-4 w-4 mr-1" />
                                                    View
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                            {orders?.length === 0 && (
                                <tr>
                                    <td colSpan={7} className="py-8 text-center text-muted-foreground">
                                        No orders found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Order Details Dialog */}
            <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
                <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>
                            Order #{selectedOrder?.order_number || selectedOrder?.id.slice(0, 8)}
                        </DialogTitle>
                    </DialogHeader>

                    {selectedOrder && (
                        <div className="space-y-6 py-4">
                            {/* Order Status */}
                            <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                                <div>
                                    <Label className="text-muted-foreground">Status</Label>
                                    <div className={`mt-1 px-3 py-1 rounded-full text-sm font-medium inline-block ${getStatusInfo(selectedOrder.status).color}`}>
                                        {getStatusInfo(selectedOrder.status).label}
                                    </div>
                                </div>
                                <div className="text-right">
                                    <Label className="text-muted-foreground">Order Date</Label>
                                    <div className="mt-1 text-sm">{formatDate(selectedOrder.created_at)}</div>
                                </div>
                            </div>

                            {/* Customer Info */}
                            <div>
                                <Label className="text-sm font-medium">Customer Details</Label>
                                <div className="mt-2 p-4 border rounded-lg space-y-2">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <span className="text-xs text-muted-foreground">Name</span>
                                            <div className="font-medium">{selectedOrder.shipping_name}</div>
                                        </div>
                                        <div>
                                            <span className="text-xs text-muted-foreground">Phone</span>
                                            <div className="font-medium">{selectedOrder.shipping_phone}</div>
                                        </div>
                                    </div>
                                    <div>
                                        <span className="text-xs text-muted-foreground">Email</span>
                                        <div className="font-medium">{selectedOrder.shipping_email}</div>
                                    </div>
                                    <div>
                                        <span className="text-xs text-muted-foreground">Shipping Address</span>
                                        <div className="font-medium">
                                            {selectedOrder.shipping_address}, {selectedOrder.shipping_city}, {selectedOrder.shipping_state} - {selectedOrder.shipping_pincode}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Order Items */}
                            <div>
                                <Label className="text-sm font-medium">Order Items</Label>
                                <div className="mt-2 border rounded-lg divide-y">
                                    {selectedOrder.items?.map((item) => (
                                        <div key={item.id} className="p-3 flex items-center gap-4">
                                            {item.product_image && (
                                                <img
                                                    src={item.product_image}
                                                    alt={item.product_name}
                                                    className="w-12 h-12 rounded object-cover"
                                                />
                                            )}
                                            <div className="flex-1">
                                                <div className="font-medium">{item.product_name}</div>
                                                <div className="text-sm text-muted-foreground">
                                                    {formatPrice(item.price)} × {item.quantity}
                                                </div>
                                            </div>
                                            <div className="font-medium">
                                                {formatPrice(item.price * item.quantity)}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Order Summary */}
                            <div className="border-t pt-4 space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Subtotal</span>
                                    <span>{formatPrice(selectedOrder.subtotal)}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Shipping</span>
                                    <span>{selectedOrder.shipping_cost === 0 ? 'Free' : formatPrice(selectedOrder.shipping_cost)}</span>
                                </div>
                                {selectedOrder.discount_amount > 0 && (
                                    <div className="flex justify-between text-sm text-green-600">
                                        <span>Discount</span>
                                        <span>-{formatPrice(selectedOrder.discount_amount)}</span>
                                    </div>
                                )}
                                <div className="flex justify-between font-semibold text-lg pt-2 border-t">
                                    <span>Total</span>
                                    <span>{formatPrice(selectedOrder.total)}</span>
                                </div>
                            </div>

                            {/* Notes */}
                            {selectedOrder.notes && (
                                <div>
                                    <Label className="text-sm font-medium">Order Notes</Label>
                                    <div className="mt-2 p-3 bg-muted/30 rounded-lg text-sm">
                                        {selectedOrder.notes}
                                    </div>
                                </div>
                            )}

                            {/* Update Status */}
                            <div className="flex items-center gap-4 pt-4 border-t">
                                <Label>Update Status:</Label>
                                <Select
                                    value={selectedOrder.status}
                                    onValueChange={(value) => {
                                        handleStatusChange(selectedOrder.id, value);
                                        setSelectedOrder({ ...selectedOrder, status: value });
                                    }}
                                >
                                    <SelectTrigger className="w-40">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {ORDER_STATUSES.map((status) => (
                                            <SelectItem key={status.value} value={status.value}>
                                                <div className="flex items-center gap-2">
                                                    <status.icon className="h-4 w-4" />
                                                    {status.label}
                                                </div>
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}
