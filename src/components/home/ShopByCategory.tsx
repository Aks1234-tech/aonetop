import { Link } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';

const categories = [
  {
    id: 'black-tea',
    name: 'Black Tea',
    description: 'Bold & robust',
    image: 'https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=600&q=80',
    count: 12,
  },
  {
    id: 'green-tea',
    name: 'Green Tea',
    description: 'Light & refreshing',
    image: 'https://images.unsplash.com/photo-1627435601361-ec25f5b1d0e5?w=600&q=80',
    count: 8,
  },
  {
    id: 'chai-blends',
    name: 'Chai Blends',
    description: 'Spiced & aromatic',
    image: 'https://images.unsplash.com/photo-1561336526-2914f13ceb36?w=600&q=80',
    count: 6,
  },
  {
    id: 'herbal-tea',
    name: 'Herbal Tea',
    description: 'Caffeine-free wellness',
    image: 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=600&q=80',
    count: 10,
  },
  {
    id: 'white-tea',
    name: 'White Tea',
    description: 'Delicate & rare',
    image: 'https://images.unsplash.com/photo-1558160074-4d7d8bdf4256?w=600&q=80',
    count: 4,
  },
  {
    id: 'oolong-tea',
    name: 'Oolong Tea',
    description: 'Complex & nuanced',
    image: 'https://images.unsplash.com/photo-1564890369478-c89ca6d9cde9?w=600&q=80',
    count: 5,
  },
];

export function ShopByCategory() {
  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-accent font-medium tracking-widest uppercase text-sm">
            Browse Our Selection
          </span>
          <h2 className="font-display text-3xl sm:text-4xl font-semibold text-foreground mt-2 mb-4">
            Shop by Category
          </h2>
          <p className="text-muted-foreground leading-relaxed">
            From robust black teas to delicate white teas, find your perfect cup 
            in our carefully curated collections.
          </p>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 lg:gap-6">
          {categories.map((category, index) => (
            <Link
              key={category.id}
              to={`/shop?category=${category.id}`}
              className="group relative overflow-hidden rounded-2xl aspect-[4/3] animate-fade-up"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <img
                src={category.image}
                alt={category.name}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-foreground/80 via-foreground/30 to-transparent" />
              <div className="absolute inset-0 flex flex-col justify-end p-5 lg:p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-display text-lg lg:text-xl font-semibold text-card group-hover:text-gold transition-colors">
                      {category.name}
                    </h3>
                    <p className="text-sm text-card/70 mt-1">
                      {category.description}
                    </p>
                    <p className="text-xs text-card/60 mt-2">
                      {category.count} products
                    </p>
                  </div>
                  <div className="w-10 h-10 rounded-full bg-card/20 backdrop-blur-sm flex items-center justify-center opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
                    <ArrowUpRight className="h-5 w-5 text-card" />
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
