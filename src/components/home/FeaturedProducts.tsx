import { Link } from 'react-router-dom';
import { ArrowRight, ShoppingBag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getFeaturedProducts } from '@/data/products';
import { useCart } from '@/contexts/CartContext';

export function FeaturedProducts() {
  const featured = getFeaturedProducts().slice(0, 3);
  const { addToCart } = useCart();

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
    }).format(price);
  };

  return (
    <section className="py-20 bg-muted/30">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-12">
          <div>
            <span className="text-accent font-medium tracking-widest uppercase text-sm">
              Curated Selection
            </span>
            <h2 className="font-display text-3xl sm:text-4xl font-semibold text-foreground mt-2">
              Featured Collection
            </h2>
          </div>
          <Button variant="ghost" asChild className="self-start md:self-auto">
            <Link to="/shop" className="group">
              Explore All
              <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
            </Link>
          </Button>
        </div>

        {/* Featured Grid */}
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Large Featured Item */}
          {featured[0] && (
            <div className="group relative bg-card rounded-3xl overflow-hidden shadow-soft hover:shadow-elevated transition-all duration-300 animate-fade-up">
              <Link to={`/products/${featured[0].id}`} className="block">
                <div className="aspect-[4/3] overflow-hidden">
                  <img
                    src={featured[0].image}
                    alt={featured[0].name}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                </div>
              </Link>
              <div className="absolute inset-0 bg-gradient-to-t from-foreground/80 via-foreground/20 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-8">
                <span className="inline-block px-3 py-1 bg-accent text-accent-foreground text-xs font-semibold rounded-full mb-3">
                  Featured
                </span>
                <Link to={`/products/${featured[0].id}`}>
                  <h3 className="font-display text-2xl sm:text-3xl font-semibold text-card mb-2 group-hover:text-gold transition-colors">
                    {featured[0].name}
                  </h3>
                </Link>
                <p className="text-card/80 mb-4 max-w-md">
                  {featured[0].description}
                </p>
                <div className="flex items-center justify-between">
                  <span className="font-display text-2xl font-semibold text-gold">
                    {formatPrice(featured[0].price)}
                  </span>
                  <Button
                    variant="default"
                    onClick={() =>
                      addToCart({
                        id: featured[0].id,
                        name: featured[0].name,
                        price: featured[0].price,
                        image: featured[0].image,
                        weight: featured[0].weight,
                      })
                    }
                  >
                    <ShoppingBag className="mr-2 h-5 w-5" />
                    Add to Cart
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Smaller Featured Items */}
          <div className="space-y-8">
            {featured.slice(1, 3).map((product, index) => (
              <div
                key={product.id}
                className="group flex gap-6 bg-card rounded-2xl overflow-hidden shadow-soft hover:shadow-elevated transition-all duration-300 animate-fade-up"
                style={{ animationDelay: `${(index + 1) * 0.1}s` }}
              >
                <Link to={`/products/${product.id}`} className="shrink-0 w-40 h-40">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                </Link>
                <div className="flex-1 p-5 flex flex-col justify-center">
                  <span className="text-xs text-accent font-medium uppercase tracking-wider">
                    {product.category}
                  </span>
                  <Link to={`/products/${product.id}`}>
                    <h3 className="font-display text-lg font-medium text-foreground group-hover:text-primary transition-colors mt-1">
                      {product.name}
                    </h3>
                  </Link>
                  <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                    {product.description}
                  </p>
                  <div className="flex items-center justify-between mt-3">
                    <span className="font-display text-lg font-semibold text-primary">
                      {formatPrice(product.price)}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      className="hover:bg-primary hover:text-primary-foreground"
                      onClick={() =>
                        addToCart({
                          id: product.id,
                          name: product.name,
                          price: product.price,
                          image: product.image,
                          weight: product.weight,
                        })
                      }
                    >
                      <ShoppingBag className="mr-2 h-4 w-4" />
                      Add
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
