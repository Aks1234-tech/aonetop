import { useState } from 'react';
import { ShoppingBag, Users, Eye, Tag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { OffersManager } from '@/components/admin/OffersManager';
import { ProductsManager } from '@/components/admin/ProductsManager';
import { OrdersManager } from '@/components/admin/OrdersManager';
import { InquiriesManager } from '@/components/admin/InquiriesManager';

const Admin = () => {
  const [activeTab, setActiveTab] = useState<'products' | 'orders' | 'inquiries' | 'offers'>('products');

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

          {activeTab === 'inquiries' && <InquiriesManager />}

          {activeTab === 'offers' && <OffersManager />}
        </div>
      </div>
    </div>
  );
};

export default Admin;
