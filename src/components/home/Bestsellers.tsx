import { Link } from 'react-router-dom';
import { ArrowRight, Star, ShoppingBag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getBestsellers } from '@/data/products';
import { useCart } from '@/contexts/CartContext';

export function Bestsellers() {
  const bestsellers = getBestsellers().slice(0, 4);
  const { addToCart } = useCart();

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
    }).format(price);
  };

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
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 lg:gap-8">
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
                  {product.originalPrice && (
                    <span className="px-3 py-1 bg-destructive text-destructive-foreground text-xs font-semibold rounded-full">
                      Sale
                    </span>
                  )}
                </div>
                {/* Quick Add */}
                <Button
                  variant="default"
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
                {/* <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                  {product.description}
                </p> */}
                <div className="flex items-center gap-3 mt-2">
                  <span className="font-display text-xl font-semibold text-primary">
                    {formatPrice(product.price)}
                  </span>
                  {product.originalPrice && (
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
