import { useState } from 'react';
import { ShoppingBag, Users, Eye, Tag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { OffersManager } from '@/components/admin/OffersManager';
import { ProductsManager } from '@/components/admin/ProductsManager';

type Order = {
  id: string;
  customer: string;
  total: number;
  status: 'Pending' | 'Shipped' | 'Delivered';
  date: string;
};

type Inquiry = {
  id: string;
  company: string;
  contact: string;
  volume: string;
  date: string;
};

const Admin = () => {
  const [activeTab, setActiveTab] = useState<'products' | 'orders' | 'inquiries' | 'offers'>('products');

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const mockOrders: Order[] = [
    { id: '#1001', customer: 'Aarav Sharma', total: 1499, status: 'Delivered', date: '2025-12-01' },
    { id: '#1002', customer: 'Priya Gupta', total: 899, status: 'Shipped', date: '2025-12-03' },
    { id: '#1003', customer: 'Rahul Verma', total: 2199, status: 'Pending', date: '2025-12-05' },
  ];

  const mockInquiries: Inquiry[] = [
    { id: 'BQ-001', company: 'ChaiCo Pvt Ltd', contact: 'neha@chaico.in', volume: '500 units', date: '2025-12-02' },
    { id: 'BQ-002', company: 'SpiceWorks', contact: 'sales@spiceworks.com', volume: '1,200 units', date: '2025-12-07' },
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-6">
        <div className="mb-6">
          <div className="flex flex-wrap gap-2">
            <Button
              variant={activeTab === 'products' ? 'default' : 'ghost'}
              onClick={() => setActiveTab('products')}
            >
              <Eye className="mr-2 h-4 w-4" />
              Products
            </Button>
            <Button
              variant={activeTab === 'orders' ? 'default' : 'ghost'}
              onClick={() => setActiveTab('orders')}
            >
              <ShoppingBag className="mr-2 h-4 w-4" />
              Orders
            </Button>
            <Button
              variant={activeTab === 'inquiries' ? 'default' : 'ghost'}
              onClick={() => setActiveTab('inquiries')}
            >
              <Users className="mr-2 h-4 w-4" />
              Bulk Inquiries
            </Button>
            <Button
              variant={activeTab === 'offers' ? 'default' : 'ghost'}
              onClick={() => setActiveTab('offers')}
            >
              <Tag className="mr-2 h-4 w-4" />
              Offers
            </Button>
          </div>
        </div>

        <div className="p-6 border rounded-lg">
          {activeTab === 'products' && <ProductsManager />}

          {activeTab === 'orders' && (
            <div>
              <h2 className="font-display text-lg font-semibold text-foreground mb-6">Recent Orders</h2>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Order ID</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Customer</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Total</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Status</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Date</th>
                      <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {mockOrders.map((order) => (
                      <tr key={order.id} className="border-b border-border last:border-0">
                        <td className="py-3 px-4 font-medium text-foreground">{order.id}</td>
                        <td className="py-3 px-4 text-muted-foreground">{order.customer}</td>
                        <td className="py-3 px-4 text-foreground">{formatPrice(order.total)}</td>
                        <td className="py-3 px-4">
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${order.status === 'Delivered'
                              ? 'bg-primary/10 text-primary'
                              : order.status === 'Shipped'
                                ? 'bg-accent/10 text-accent'
                                : 'bg-muted text-muted-foreground'
                              }`}
                          >
                            {order.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-muted-foreground">{order.date}</td>
                        <td className="py-3 px-4">
                          <div className="flex justify-end">
                            <Button variant="ghost" size="sm">
                              View Details
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'inquiries' && (
            <div>
              <h2 className="font-display text-lg font-semibold text-foreground mb-6">Bulk Order Inquiries</h2>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">ID</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Company</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Contact</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Volume</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Date</th>
                      <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {mockInquiries.map((inquiry) => (
                      <tr key={inquiry.id} className="border-b border-border last:border-0">
                        <td className="py-3 px-4 font-medium text-foreground">{inquiry.id}</td>
                        <td className="py-3 px-4 text-foreground">{inquiry.company}</td>
                        <td className="py-3 px-4 text-muted-foreground">{inquiry.contact}</td>
                        <td className="py-3 px-4 text-muted-foreground">{inquiry.volume}</td>
                        <td className="py-3 px-4 text-muted-foreground">{inquiry.date}</td>
                        <td className="py-3 px-4">
                          <div className="flex justify-end">
                            <Button variant="ghost" size="sm">View Details</Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'offers' && <OffersManager />}
        </div>
      </div>
    </div>
  );
};

export default Admin;
