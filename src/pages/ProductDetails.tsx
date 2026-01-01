import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Star, Plus, Minus, ShoppingBag, Leaf, Thermometer, Clock, Scale, MapPin, Check, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useProduct, useProducts } from '@/hooks/useProducts';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

const ProductDetails = () => {
  const { id } = useParams<{ id: string }>();
  const { data: product, isLoading, error } = useProduct(id || '');
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const { addToCart } = useCart();
  const { isAdmin } = useAuth();
  const { toast } = useToast();

  // Fetch related products from same category
  const { data: relatedProducts = [] } = useProducts({
    filters: { category: product?.category },
    limit: 5,
  });

  const filteredRelated = relatedProducts.filter(p => p.id !== product?.id).slice(0, 4);

  const formatPrice = (price: number) => {
    // Prices are stored in paise, convert to rupees
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
    }).format(price / 100);
  };

  const getProductImage = (p: typeof product) => {
    if (!p) return '';
    const primaryImage = p.images?.find(img => img.is_primary);
    return primaryImage?.url || p.images?.[0]?.url || 'https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=800&q=80';
  };

  const getProductImages = () => {
    if (!product?.images?.length) return [getProductImage(product)];
    return product.images
      .sort((a, b) => a.sort_order - b.sort_order)
      .map(img => img.url);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!product || error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <h1 className="font-display text-2xl font-semibold text-foreground mb-4">
            Product not found
          </h1>
          <Button variant="default" asChild>
            <Link to="/shop">Back to Shop</Link>
          </Button>
        </div>
      </div>
    );
  }

  const images = getProductImages();

  const handleAddToCart = () => {
    for (let i = 0; i < quantity; i++) {
      addToCart({
        id: product.id,
        name: product.name,
        price: product.price / 100, // Convert from paise
        image: getProductImage(product),
        weight: product.weight || undefined,
      });
    }
    toast({
      title: 'Added to cart',
      description: `${quantity} × ${product.name} added to your cart`,
    });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Breadcrumb */}
      <div className="bg-muted/50 py-4">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Link to="/" className="hover:text-foreground transition-colors">Home</Link>
            <span>/</span>
            <Link to="/shop" className="hover:text-foreground transition-colors">Shop</Link>
            <span>/</span>
            <span className="text-foreground">{product.name}</span>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid lg:grid-cols-2 gap-12">
          {/* Images */}
          <div className="space-y-4">
            <div className="aspect-square rounded-2xl overflow-hidden bg-muted">
              <img
                src={images[selectedImage] || getProductImage(product)}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            </div>
            {images.length > 1 && (
              <div className="flex gap-3">
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImage(idx)}
                    className={`w-20 h-20 rounded-lg overflow-hidden border-2 transition-colors ${selectedImage === idx ? 'border-primary' : 'border-transparent'
                      }`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Details */}
          <div>
            {/* Badges */}
            <div className="flex flex-wrap gap-2 mb-4">
              {product.is_bestseller && (
                <span className="px-3 py-1 bg-accent text-accent-foreground text-sm font-medium rounded-full">
                  Bestseller
                </span>
              )}
              {product.is_new && (
                <span className="px-3 py-1 bg-primary text-primary-foreground text-sm font-medium rounded-full">
                  New Arrival
                </span>
              )}
              {product.original_price && (
                <span className="px-3 py-1 bg-destructive text-destructive-foreground text-sm font-medium rounded-full">
                  {Math.round((1 - product.price / product.original_price) * 100)}% Off
                </span>
              )}
            </div>

            <h1 className="font-display text-3xl sm:text-4xl font-semibold text-foreground mb-4">
              {product.name}
            </h1>

            {/* Rating */}
            <div className="flex items-center gap-2 mb-6">
              <div className="flex gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`h-5 w-5 ${i < Math.floor(product.rating)
                      ? 'fill-accent text-accent'
                      : 'text-muted'
                      }`}
                  />
                ))}
              </div>
              <span className="font-medium text-foreground">{product.rating}</span>
              <span className="text-muted-foreground">({product.reviews_count} reviews)</span>
            </div>

            {/* Price */}
            <div className="flex items-baseline gap-4 mb-6">
              <span className="font-display text-3xl font-bold text-primary">
                {formatPrice(product.price)}
              </span>
              {product.original_price && (
                <span className="text-xl text-muted-foreground line-through">
                  {formatPrice(product.original_price)}
                </span>
              )}
              <span className="text-muted-foreground">/ {product.weight}</span>
            </div>

            <p className="text-muted-foreground leading-relaxed mb-8">
              {product.long_description || product.description}
            </p>

            {/* Info Grid */}
            <div className="grid grid-cols-2 gap-4 mb-8">
              <div className="flex items-center gap-3 p-4 bg-muted/50 rounded-xl">
                <MapPin className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">Origin</p>
                  <p className="font-medium text-foreground">{product.origin}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-4 bg-muted/50 rounded-xl">
                <Leaf className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">Category</p>
                  <p className="font-medium text-foreground">{product.category}</p>
                </div>
              </div>
            </div>

            {/* Brewing Instructions */}
            <div className="bg-muted/50 rounded-xl p-6 mb-8">
              <h3 className="font-display text-lg font-semibold text-foreground mb-4">
                Brewing Instructions
              </h3>
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="w-12 h-12 rounded-full bg-background flex items-center justify-center mx-auto mb-2">
                    <Thermometer className="h-5 w-5 text-primary" />
                  </div>
                  <p className="text-sm text-muted-foreground">Temperature</p>
                  <p className="font-medium text-foreground">{product.brewing_temp || 'N/A'}</p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 rounded-full bg-background flex items-center justify-center mx-auto mb-2">
                    <Clock className="h-5 w-5 text-primary" />
                  </div>
                  <p className="text-sm text-muted-foreground">Steep Time</p>
                  <p className="font-medium text-foreground">{product.brewing_time || 'N/A'}</p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 rounded-full bg-background flex items-center justify-center mx-auto mb-2">
                    <Scale className="h-5 w-5 text-primary" />
                  </div>
                  <p className="text-sm text-muted-foreground">Amount</p>
                  <p className="font-medium text-foreground">{product.brewing_amount || 'N/A'}</p>
                </div>
              </div>
            </div>

            {/* Quantity & Add to Cart */}
            {!isAdmin && (
              <div className="flex flex-col sm:flex-row gap-4 mb-8">
                <div className="flex items-center border border-border rounded-lg">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    disabled={quantity <= 1}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <span className="w-12 text-center font-medium">{quantity}</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setQuantity(quantity + 1)}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <Button
                  variant="gold"
                  size="lg"
                  className="flex-1"
                  onClick={handleAddToCart}
                  disabled={!product.in_stock}
                >
                  <ShoppingBag className="mr-2 h-5 w-5" />
                  {product.in_stock ? 'Add to Cart' : 'Out of Stock'}
                </Button>
              </div>
            )}

            {/* Tags */}
            <div className="flex flex-wrap gap-2">
              {product.tags?.map((tag) => (
                <span
                  key={tag}
                  className="px-3 py-1 bg-muted text-muted-foreground text-sm rounded-full"
                >
                  {tag}
                </span>
              ))}
            </div>

            {/* Trust Badges */}
            <div className="flex flex-wrap gap-4 mt-8 pt-8 border-t border-border">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Check className="h-4 w-4 text-primary" />
                Free shipping over ₹999
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Check className="h-4 w-4 text-primary" />
                Fresh packaging
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Check className="h-4 w-4 text-primary" />
                100% authentic
              </div>
            </div>
          </div>
        </div>

        {/* Related Products */}
        {filteredRelated.length > 0 && (
          <div className="mt-20">
            <h2 className="font-display text-2xl font-semibold text-foreground mb-8">
              You May Also Like
            </h2>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
              {filteredRelated.map((p) => (
                <Link
                  key={p.id}
                  to={`/products/${p.slug}`}
                  className="group bg-card rounded-2xl overflow-hidden shadow-soft hover:shadow-elevated transition-all duration-300"
                >
                  <div className="aspect-square overflow-hidden">
                    <img
                      src={p.images?.[0]?.url || getProductImage(p)}
                      alt={p.name}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                  </div>
                  <div className="p-4">
                    <h3 className="font-display font-medium text-foreground group-hover:text-primary transition-colors">
                      {p.name}
                    </h3>
                    <p className="font-display text-lg font-semibold text-primary mt-1">
                      {formatPrice(p.price)}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductDetails;
