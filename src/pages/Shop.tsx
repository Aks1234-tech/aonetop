import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Filter, Grid, List, Star, ShoppingBag, X, ChevronDown, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useProducts, useCategories, type Product } from '@/hooks/useProducts';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';

const Shop = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [loadTimeout, setLoadTimeout] = useState(false);
  const { addToCart } = useCart();
  const { isAdmin } = useAuth();

  const selectedCategory = searchParams.get('category') || '';
  const sortBy = (searchParams.get('sort') || 'featured') as 'featured' | 'price-asc' | 'price-desc' | 'name' | 'rating';

  // Fetch products from Supabase with filters
  const { data: products = [] as Product[], isLoading, error } = useProducts({
    filters: {
      category: selectedCategory || undefined,
      search: searchQuery || undefined,
    },
    sortBy,
  });

  // Fetch categories from Supabase
  const { data: categories = [] } = useCategories();

  // Loading timeout fallback
  useEffect(() => {
    if (isLoading) {
      const t = setTimeout(() => setLoadTimeout(true), 8000);
      return () => clearTimeout(t);
    }
    setLoadTimeout(false);
  }, [isLoading]);

  const formatPrice = (price: number) => {
    // Prices are stored in paise, convert to rupees
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
    }).format(price / 100);
  };

  const getProductImage = (product: Product) => {
    const primaryImage = product.images?.find(img => img.is_primary);
    return primaryImage?.url || product.images?.[0]?.url || 'https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=800&q=80';
  };

  const handleCategoryChange = (category: string) => {
    if (category === selectedCategory) {
      searchParams.delete('category');
    } else {
      searchParams.set('category', category);
    }
    setSearchParams(searchParams);
  };

  const handleSortChange = (sort: string) => {
    searchParams.set('sort', sort);
    setSearchParams(searchParams);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-muted/50 py-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="font-display text-4xl font-semibold text-foreground text-center mb-4">
            Our Tea Collection
          </h1>
          <p className="text-muted-foreground text-center max-w-xl mx-auto">
            Discover our carefully curated selection of premium teas from India's finest gardens
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Filters */}
          <aside
            className={cn(
              "lg:w-64 shrink-0",
              showFilters ? "block" : "hidden lg:block"
            )}
          >
            <div className="bg-card rounded-2xl p-6 shadow-soft sticky top-24">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-display text-lg font-semibold text-foreground">
                  Filters
                </h3>
                <Button
                  variant="ghost"
                  size="icon"
                  className="lg:hidden"
                  onClick={() => setShowFilters(false)}
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>

              {/* Search */}
              <div className="mb-6">
                <Input
                  placeholder="Search teas..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-background"
                />
              </div>

              {/* Categories */}
              <div className="mb-6">
                <h4 className="font-medium text-foreground mb-3">Categories</h4>
                <div className="space-y-2">
                  {categories.map((category) => (
                    <button
                      key={category.id}
                      onClick={() => handleCategoryChange(category.id)}
                      className={cn(
                        "w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors",
                        selectedCategory === category.id
                          ? "bg-primary text-primary-foreground"
                          : "hover:bg-muted text-muted-foreground hover:text-foreground"
                      )}
                    >
                      <span>{category.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Clear Filters */}
              {(selectedCategory || searchQuery) && (
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => {
                    setSearchQuery('');
                    setSearchParams({});
                  }}
                >
                  Clear Filters
                </Button>
              )}
            </div>
          </aside>

          {/* Products */}
          <div className="flex-1">
            {/* Toolbar */}
            <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
              <div className="flex items-center gap-4">
                <Button
                  variant="outline"
                  className="lg:hidden"
                  onClick={() => setShowFilters(true)}
                >
                  <Filter className="h-5 w-5 mr-2" />
                  Filters
                </Button>
                <span className="text-muted-foreground">
                  {isLoading ? 'Loading...' : `${products.length} products`}
                </span>
              </div>

              <div className="flex items-center gap-4">
                {/* Sort */}
                <div className="relative">
                  <select
                    value={sortBy}
                    onChange={(e) => handleSortChange(e.target.value)}
                    className="appearance-none bg-card border border-border rounded-lg px-4 py-2 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  >
                    <option value="featured">Featured</option>
                    <option value="price-asc">Price: Low to High</option>
                    <option value="price-desc">Price: High to Low</option>
                    <option value="name">Name</option>
                    <option value="rating">Rating</option>
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                </div>

                {/* View Mode */}
                <div className="hidden sm:flex items-center gap-1 bg-muted rounded-lg p-1">
                  <Button
                    variant={viewMode === 'grid' ? 'default' : 'ghost'}
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => setViewMode('grid')}
                  >
                    <Grid className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={viewMode === 'list' ? 'default' : 'ghost'}
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => setViewMode('list')}
                  >
                    <List className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Product Grid */}
            {isLoading && !loadTimeout ? (
              <div className="flex items-center justify-center py-16">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : (isLoading && loadTimeout) ? (
              <div className="text-center py-16">
                <p className="text-muted-foreground mb-4">Still loading products… This can take a moment.</p>
                <Button
                  variant="outline"
                  onClick={() => {
                    setSearchQuery('');
                    setSearchParams({});
                  }}
                >
                  Clear Filters
                </Button>
              </div>
            ) : error ? (
              <div className="text-center py-16">
                <p className="text-muted-foreground mb-4">Couldn't load products. Please try again.</p>
                <Button
                  variant="outline"
                  onClick={() => {
                    setSearchQuery('');
                    setSearchParams({});
                  }}
                >
                  Clear Filters
                </Button>
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-16">
                <p className="text-muted-foreground mb-4">No products found</p>
                <Button
                  variant="outline"
                  onClick={() => {
                    setSearchQuery('');
                    setSearchParams({});
                  }}
                >
                  Clear Filters
                </Button>
              </div>
            ) : (
              <div
                className={cn(
                  viewMode === 'grid'
                    ? "grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6"
                    : "space-y-4"
                )}
              >
                {products.map((product, index) => (
                  <div
                    key={product.id}
                    className={cn(
                      "group bg-card rounded-2xl overflow-hidden shadow-soft hover:shadow-elevated transition-all duration-300 animate-fade-up",
                      viewMode === 'list' && "flex"
                    )}
                    style={{ animationDelay: `${index * 0.05}s` }}
                  >
                    {/* Image */}
                    <Link
                      to={`/products/${product.slug}`}
                      className={cn(
                        "block relative overflow-hidden",
                        viewMode === 'grid' ? "aspect-square" : "w-48 shrink-0"
                      )}
                    >
                      <img
                        src={getProductImage(product)}
                        alt={product.name}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                      {/* Badges */}
                      <div className="absolute top-3 left-3 flex flex-col gap-2">
                        {product.is_bestseller && (
                          <span className="px-2 py-1 bg-accent text-accent-foreground text-xs font-semibold rounded-full">
                            Bestseller
                          </span>
                        )}
                        {product.is_new && (
                          <span className="px-2 py-1 bg-primary text-primary-foreground text-xs font-semibold rounded-full">
                            New
                          </span>
                        )}
                        {product.original_price && (
                          <span className="px-2 py-1 bg-destructive text-destructive-foreground text-xs font-semibold rounded-full">
                            Sale
                          </span>
                        )}
                      </div>
                    </Link>

                    {/* Content */}
                    <div className="p-5 flex-1 flex flex-col">
                      <div className="flex items-center gap-1 mb-2">
                        <Star className="h-4 w-4 fill-accent text-accent" />
                        <span className="text-sm font-medium text-foreground">
                          {product.rating}
                        </span>
                        <span className="text-sm text-muted-foreground">
                          ({product.reviews_count})
                        </span>
                      </div>
                      <Link to={`/products/${product.slug}`}>
                        <h3 className="font-display text-lg font-medium text-foreground group-hover:text-primary transition-colors">
                          {product.name}
                        </h3>
                      </Link>
                      <p className="text-sm text-muted-foreground mt-1 line-clamp-2 flex-1">
                        {product.description}
                      </p>
                      <div className="flex items-center justify-between mt-4">
                        <div className="flex items-center gap-2">
                          <span className="font-display text-xl font-semibold text-primary">
                            {formatPrice(product.price)}
                          </span>
                          {product.original_price && (
                            <span className="text-sm text-muted-foreground line-through">
                              {formatPrice(product.original_price)}
                            </span>
                          )}
                        </div>
                        {!isAdmin && (
                          <Button
                            variant="gold"
                            size="sm"
                            onClick={() =>
                              addToCart({
                                id: product.id,
                                name: product.name,
                                price: product.price / 100, // Convert from paise
                                image: getProductImage(product),
                                weight: product.weight || undefined,
                              })
                            }
                          >
                            <ShoppingBag className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Shop;
