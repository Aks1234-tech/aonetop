import { useState, useEffect } from 'react';
import { X, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase, Tables } from '@/lib/supabase';

interface OfferProductSelectorProps {
  offerId?: string;
  appliesTo: 'all' | 'products' | 'category';
  onSelectionChange: (selections: { productIds: string[]; categories: string[] }) => void;
}

interface ProductOption {
  id: string;
  name: string;
  category: string;
}

export function OfferProductSelector({
  offerId,
  appliesTo,
  onSelectionChange,
}: OfferProductSelectorProps) {
  const [products, setProducts] = useState<ProductOption[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Load products and categories
  useEffect(() => {
    const loadData = async () => {
      try {
        // Fetch all products
        const { data: productsData } = await supabase
          .from('products')
          .select('id, name, category')
          .order('name');

        if (productsData) {
          setProducts(productsData as ProductOption[]);
          // Extract unique categories
          const uniqueCategories = Array.from(
            new Set(productsData.map((p: any) => p.category))
          );
          setCategories(uniqueCategories);
        }

        // Load existing selections if editing
        if (offerId) {
          const { data: selections } = await (supabase
            .from('offer_products') as any)
            .select('product_id, category')
            .eq('offer_id', offerId);

          if (selections) {
            const productIds = (selections as any[])
              .filter((s: any) => s.product_id)
              .map((s: any) => s.product_id);
            const cats = (selections as any[])
              .filter((s: any) => s.category)
              .map((s: any) => s.category);

            setSelectedProducts(productIds);
            setSelectedCategories(cats);
          }
        }
      } catch (error) {
        console.error('Error loading products:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [offerId]);

  // Notify parent of changes
  useEffect(() => {
    onSelectionChange({
      productIds: selectedProducts,
      categories: selectedCategories,
    });
  }, [selectedProducts, selectedCategories, onSelectionChange]);

  if (appliesTo === 'all') {
    return (
      <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
        <p className="text-sm text-blue-800">
          ℹ️ This offer applies to all products. No selection needed.
        </p>
      </div>
    );
  }

  if (isLoading) {
    return <div className="text-center py-4 text-muted-foreground">Loading products...</div>;
  }

  const filteredProducts = products.filter(
    (p) =>
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <Tabs defaultValue={appliesTo === 'products' ? 'products' : 'categories'} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="products">Select Products</TabsTrigger>
          <TabsTrigger value="categories">Select Categories</TabsTrigger>
        </TabsList>

        <TabsContent value="products" className="space-y-3">
          <div className="space-y-2">
            <Label htmlFor="product-search">Search Products</Label>
            <Input
              id="product-search"
              placeholder="Search by product name or category..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="max-h-60 overflow-y-auto border rounded-lg p-3 space-y-2">
            {filteredProducts.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4 text-center">
                {searchTerm ? 'No products found' : 'No products available'}
              </p>
            ) : (
              filteredProducts.map((product) => (
                <label
                  key={product.id}
                  className="flex items-center gap-3 p-2 hover:bg-muted rounded-md cursor-pointer transition-colors"
                >
                  <input
                    type="checkbox"
                    checked={selectedProducts.includes(product.id)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedProducts([...selectedProducts, product.id]);
                      } else {
                        setSelectedProducts(
                          selectedProducts.filter((id) => id !== product.id)
                        );
                      }
                    }}
                    className="w-4 h-4"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm truncate">{product.name}</div>
                    <div className="text-xs text-muted-foreground">{product.category}</div>
                  </div>
                  {selectedProducts.includes(product.id) && (
                    <Check className="h-4 w-4 text-green-600 flex-shrink-0" />
                  )}
                </label>
              ))
            )}
          </div>

          {selectedProducts.length > 0 && (
            <div className="space-y-2">
              <Label className="text-xs">Selected Products ({selectedProducts.length})</Label>
              <div className="flex flex-wrap gap-2">
                {selectedProducts.map((productId) => {
                  const product = products.find((p) => p.id === productId);
                  return (
                    <div
                      key={productId}
                      className="flex items-center gap-1 bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs"
                    >
                      {product?.name}
                      <button
                        onClick={() =>
                          setSelectedProducts(
                            selectedProducts.filter((id) => id !== productId)
                          )
                        }
                        className="ml-1 hover:opacity-70"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </TabsContent>

        <TabsContent value="categories" className="space-y-3">
          <Label>Select Categories</Label>
          <div className="max-h-60 overflow-y-auto border rounded-lg p-3 space-y-2">
            {categories.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4 text-center">
                No categories available
              </p>
            ) : (
              categories.map((category) => (
                <label
                  key={category}
                  className="flex items-center gap-3 p-2 hover:bg-muted rounded-md cursor-pointer transition-colors"
                >
                  <input
                    type="checkbox"
                    checked={selectedCategories.includes(category)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedCategories([...selectedCategories, category]);
                      } else {
                        setSelectedCategories(
                          selectedCategories.filter((cat) => cat !== category)
                        );
                      }
                    }}
                    className="w-4 h-4"
                  />
                  <div className="flex-1">
                    <div className="font-medium text-sm capitalize">
                      {category.replace('-', ' ')}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {products.filter((p) => p.category === category).length} products
                    </div>
                  </div>
                  {selectedCategories.includes(category) && (
                    <Check className="h-4 w-4 text-green-600 flex-shrink-0" />
                  )}
                </label>
              ))
            )}
          </div>

          {selectedCategories.length > 0 && (
            <div className="space-y-2">
              <Label className="text-xs">Selected Categories ({selectedCategories.length})</Label>
              <div className="flex flex-wrap gap-2">
                {selectedCategories.map((category) => (
                  <div
                    key={category}
                    className="flex items-center gap-1 bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs"
                  >
                    {category.replace('-', ' ')}
                    <button
                      onClick={() =>
                        setSelectedCategories(
                          selectedCategories.filter((cat) => cat !== category)
                        )
                      }
                      className="ml-1 hover:opacity-70"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
