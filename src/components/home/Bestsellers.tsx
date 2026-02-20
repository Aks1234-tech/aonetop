import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Star, ShoppingBag, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCart } from '@/contexts/CartContext';
import { supabase } from '@/lib/supabase';
import type { Database } from '@/lib/database.types';

type Product = Database['public']['Tables']['products']['Row'] & {
  product_images: Database['public']['Tables']['product_images']['Row'][];
};

interface BestsellerProduct {
  id: string;
  name: string;
  price: number;
  originalPrice?: number | null;
  image: string;
  rating: number;
  reviews: number;
  weight: string;
  isBestseller: boolean;
}

export function Bestsellers() {
  const [bestsellers, setBestsellers] = useState<BestsellerProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { addToCart } = useCart();

  useEffect(() => {
    async function fetchBestsellers() {
      try {
        const { data, error } = await supabase
          .from('products')
          .select('*, product_images(*)')
          .eq('is_bestseller', true)
          .limit(4);

        if (error) {
          throw error;
        }

        if (data) {
          const formattedProducts: BestsellerProduct[] = data.map((product: any) => {
            // Find primary image or use first available, or fallback
            const primaryImage = product.product_images?.find((img: any) => img.is_primary)
              || product.product_images?.[0];

            return {
              id: product.id,
              name: product.name,
              price: product.price,
              originalPrice: product.original_price,
              image: primaryImage?.url || 'https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=800&q=80', // Fallback image
              rating: product.rating || 0,
              reviews: product.reviews_count || 0,
              weight: product.weight || '100g', // Default weight if missing
              isBestseller: product.is_bestseller,
            };
          });
          setBestsellers(formattedProducts);
        }
      } catch (error) {
        console.error('Error fetching bestsellers:', error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchBestsellers();
  }, []);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
    }).format(price);
  };

  if (isLoading) {
    return (
      <section className="py-16 sm:py-16 bg-muted/100">
        <div className="container mx-auto px-4 flex justify-center items-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 sm:py-16 bg-muted/100">
      <div className="container mx-auto px-4 sm:px-6 lg:px-4">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-accent font-medium tracking-widest uppercase text-sm">
            Customer Favorites
          </span>
          <h2 className="font-display text-3xl sm:text-4xl font-semibold text-foreground mt-2 mb-4">
            Bestselling Products
          </h2>
          <p className="text-muted-foreground leading-relaxed">
            Discover our most loved teas, handpicked by tea enthusiasts and 
            cherished for their exceptional quality and taste.
          </p>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 lg:gap-8">
          {bestsellers.map((product, index) => (
            <div
              key={product.id}
              className="group bg-card rounded-2xl overflow-hidden shadow-soft hover:shadow-elevated transition-all duration-300 animate-fade-up"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              {/* Image */}
              <Link to={`/products/${product.id}`} className="block relative overflow-hidden aspect-square">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-130"
                />
                {/* Badges */}
                <div className="absolute top-4 left-4 flex flex-col gap-2">
                  {product.isBestseller && (
                    <span className="px-3 py-1 bg-accent text-accent-foreground text-xs font-semibold rounded-full">
                      Bestseller
                    </span>
                  )}
                  {product.originalPrice && product.originalPrice > product.price && (
                    <span className="px-3 py-1 bg-destructive text-destructive-foreground text-xs font-semibold rounded-full">
                      Sale
                    </span>
                  )}
                </div>
                {/* Quick Add */}
                <Button
                  variant="gold"
                  size="icon"
                  className="absolute bottom-4 right-4 opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300"
                  onClick={(e) => {
                    e.preventDefault();
                    addToCart({
                      id: product.id,
                      name: product.name,
                      price: product.price,
                      image: product.image,
                      weight: product.weight,
                    });
                  }}
                >
                  <ShoppingBag className="h-5 w-5" />
                </Button>
              </Link>

              {/* Content */}
              <div className="p-5">
                <div className="flex items-center gap-1 mb-2">
                  <Star className="h-4 w-4 fill-accent text-accent" />
                  <span className="text-sm font-medium text-foreground">{product.rating}</span>
                  <span className="text-sm text-muted-foreground">({product.reviews})</span>
                </div>
                <Link to={`/products/${product.id}`}>
                  <h3 className="font-display text-md font-medium text-foreground group-hover:text-primary transition-colors">
                    {product.name}
                  </h3>
                </Link>
                <div className="flex items-center gap-3 mt-2">
                  <span className="font-display text-xl font-semibold text-primary">
                    {formatPrice(product.price)}
                  </span>
                  {product.originalPrice && product.originalPrice > product.price && (
                    <span className="text-sm text-muted-foreground line-through">
                      {formatPrice(product.originalPrice)}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center mt-10">
          <Button variant="outline" size="lg" asChild>
            <Link to="/shop" className="group">
              View All Bestsellers
              <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
