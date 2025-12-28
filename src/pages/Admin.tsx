import { useState } from 'react';
import { Lock, Package, ShoppingBag, Users, Plus, Edit, Trash2, Eye, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { products } from '@/data/products';
import { useToast } from '@/hooks/use-toast';

const Admin = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [activeTab, setActiveTab] = useState('products');
  const { toast } = useToast();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Simple mock authentication
    if (password === 'admin123') {
      setIsAuthenticated(true);
      toast({ title: 'Welcome back!' });
    } else {
      toast({
        title: 'Invalid password',
        description: 'Please try again.',
        variant: 'destructive',
      });
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
    }).format(price);
  };

  // Mock data for orders and inquiries
  const mockOrders = [
    { id: 'ORD001', customer: 'Rahul Sharma', total: 4998, status: 'Pending', date: '2024-01-15' },
    { id: 'ORD002', customer: 'Priya Patel', total: 2499, status: 'Shipped', date: '2024-01-14' },
    { id: 'ORD003', customer: 'Amit Kumar', total: 7497, status: 'Delivered', date: '2024-01-13' },
  ];

  const mockInquiries = [
    { id: 'INQ001', company: 'Taj Hotels', contact: 'Vikram Singh', volume: '50-100kg', date: '2024-01-15' },
    { id: 'INQ002', company: 'Cafe Coffee Day', contact: 'Neha Gupta', volume: '100kg+', date: '2024-01-14' },
  ];

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center py-20">
        <div className="w-full max-w-md">
          <div className="bg-card rounded-2xl p-8 shadow-elevated">
            <div className="text-center mb-8">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <Lock className="h-8 w-8 text-primary" />
              </div>
              <h1 className="font-display text-2xl font-semibold text-foreground">
                Admin Login
              </h1>
              <p className="text-muted-foreground mt-2">
                Enter your password to access the dashboard
              </p>
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter admin password"
                />
              </div>
              <Button type="submit" variant="gold" className="w-full">
                Login
              </Button>
            </form>

            <p className="text-xs text-muted-foreground text-center mt-6">
              Demo password: admin123
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Header */}
      <div className="bg-card border-b border-border">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <h1 className="font-display text-xl font-semibold text-foreground">
              Admin Dashboard
            </h1>
            <Button
              variant="ghost"
              onClick={() => setIsAuthenticated(false)}
            >
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-card rounded-xl p-6 shadow-soft">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <Package className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-muted-foreground text-sm">Products</p>
                <p className="font-display text-2xl font-bold text-foreground">{products.length}</p>
              </div>
            </div>
          </div>
          <div className="bg-card rounded-xl p-6 shadow-soft">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center">
                <ShoppingBag className="h-6 w-6 text-accent" />
              </div>
              <div>
                <p className="text-muted-foreground text-sm">Orders</p>
                <p className="font-display text-2xl font-bold text-foreground">{mockOrders.length}</p>
              </div>
            </div>
          </div>
          <div className="bg-card rounded-xl p-6 shadow-soft">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-light/10 flex items-center justify-center">
                <Users className="h-6 w-6 text-emerald-light" />
              </div>
              <div>
                <p className="text-muted-foreground text-sm">Bulk Inquiries</p>
                <p className="font-display text-2xl font-bold text-foreground">{mockInquiries.length}</p>
              </div>
            </div>
          </div>
          <div className="bg-card rounded-xl p-6 shadow-soft">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-gold/10 flex items-center justify-center">
                <span className="text-gold text-xl">₹</span>
              </div>
              <div>
                <p className="text-muted-foreground text-sm">Revenue</p>
                <p className="font-display text-2xl font-bold text-foreground">₹14,994</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-card rounded-xl shadow-soft overflow-hidden">
          <div className="border-b border-border">
            <div className="flex gap-1 p-1">
              <Button
                variant={activeTab === 'products' ? 'default' : 'ghost'}
                onClick={() => setActiveTab('products')}
              >
                <Package className="mr-2 h-4 w-4" />
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
            </div>
          </div>

          <div className="p-6">
            {/* Products Tab */}
            {activeTab === 'products' && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="font-display text-lg font-semibold text-foreground">
                    Product Management
                  </h2>
                  <Button variant="gold">
                    <Plus className="mr-2 h-4 w-4" />
                    Add Product
                  </Button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Product</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Category</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Price</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Status</th>
                        <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {products.slice(0, 5).map((product) => (
                        <tr key={product.id} className="border-b border-border last:border-0">
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-3">
                              <img
                                src={product.image}
                                alt={product.name}
                                className="w-10 h-10 rounded-lg object-cover"
                              />
                              <span className="font-medium text-foreground">{product.name}</span>
                            </div>
                          </td>
                          <td className="py-3 px-4 text-muted-foreground">{product.category}</td>
                          <td className="py-3 px-4 text-foreground">{formatPrice(product.price)}</td>
                          <td className="py-3 px-4">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              product.inStock
                                ? 'bg-primary/10 text-primary'
                                : 'bg-destructive/10 text-destructive'
                            }`}>
                              {product.inStock ? 'In Stock' : 'Out of Stock'}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex justify-end gap-2">
                              <Button variant="ghost" size="icon">
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="icon">
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="icon" className="text-destructive">
                                <Trash2 className="h-4 w-4" />
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

            {/* Orders Tab */}
            {activeTab === 'orders' && (
              <div>
                <h2 className="font-display text-lg font-semibold text-foreground mb-6">
                  Recent Orders
                </h2>
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
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              order.status === 'Delivered'
                                ? 'bg-primary/10 text-primary'
                                : order.status === 'Shipped'
                                ? 'bg-accent/10 text-accent'
                                : 'bg-muted text-muted-foreground'
                            }`}>
                              {order.status}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-muted-foreground">{order.date}</td>
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

            {/* Inquiries Tab */}
            {activeTab === 'inquiries' && (
              <div>
                <h2 className="font-display text-lg font-semibold text-foreground mb-6">
                  Bulk Order Inquiries
                </h2>
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
          </div>
        </div>
      </div>
    </div>
  );
};

export default Admin;
