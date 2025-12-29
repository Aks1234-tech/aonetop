import { useState } from 'react';
import { ShoppingBag, Users, Eye, Tag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { OffersManager } from '@/components/admin/OffersManager';
import { ProductsManager } from '@/components/admin/ProductsManager';
import { OrdersManager } from '@/components/admin/OrdersManager';

type Inquiry = {
  id: string;
  company: string;
  contact: string;
  volume: string;
  date: string;
};

const Admin = () => {
  const [activeTab, setActiveTab] = useState<'products' | 'orders' | 'inquiries' | 'offers'>('products');

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

          {activeTab === 'orders' && <OrdersManager />}

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
