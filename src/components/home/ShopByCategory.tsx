import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Category {
  id: string;
  name: string;
  description: string;
  image: string;
  subcategories?: {
    id: string;
    name: string;
    description: string;
  }[];
}

const categories: Category[] = [
  {
    id: 'all',
    name: 'All Products',
    description: 'Browse our complete collection',
    image: 'https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=600&q=80',
  },
  {
    id: 'tea',
    name: 'Tea',
    description: 'Premium tea collection',
    image: 'https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=600&q=80',
    subcategories: [
      {
        id: 'tea-domestic',
        name: 'Domestic Tea',
        description: 'Traditional domestic tea varieties',
      },
      {
        id: 'tea-masala',
        name: 'Masala Tea',
        description: 'Spiced masala tea blends',
      },
    ],
  },
  {
    id: 'honey',
    name: 'Honey',
    description: 'Pure & natural honey',
    image: 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=600&q=80',
  },
  {
    id: 'ghee',
    name: 'Ghee',
    description: 'Premium clarified butter',
    image: 'https://images.unsplash.com/photo-1631963416786-c715c7b358dd?w=600&q=80',
  },
];

export function ShopByCategory() {
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);

  const handleCategoryClick = (category: Category, e: React.MouseEvent) => {
    if (category.subcategories && category.subcategories.length > 0) {
      e.preventDefault();
      setExpandedCategory(expandedCategory === category.id ? null : category.id);
    }
  };

  return (
    <section className="pt-5 pb-16 md:pt-8 md:pb-24 bg-background">
      <div className="container mx-auto px-4 sm:px-4 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-primary font-medium tracking-widest uppercase text-sm">
            Browse Our Selection
          </span>
          <h2 className="font-display text-3xl sm:text-4xl font-semibold text-foreground mt-2 mb-4">
            Shop by Category
          </h2>
          <p className="text-muted-foreground leading-relaxed">
            Explore our premium collection of organic products - carefully
            sourced for the finest quality.
          </p>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
          {categories.map((category, index) => (
            <div
              key={category.id}
              className="animate-fade-up"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              {/* Main Category Card */}
              <Link
                to={`/shop?category=${category.id}`}
                onClick={(e) => handleCategoryClick(category, e)}
                className="group relative overflow-hidden rounded-2xl aspect-[4/3] block ring-1 ring-border hover:ring-2 hover:ring-primary transition"
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
                      <h3 className="font-display text-xl lg:text-2xl font-semibold text-card group-hover:text-primary transition-colors">
                        {category.name}
                      </h3>
                      <p className="text-sm text-card/70 mt-1">
                        {category.description}
                      </p>
                    </div>
                    <div className="w-10 h-10 rounded-full bg-card/20 backdrop-blur-sm flex items-center justify-center opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
                      {category.subcategories ? (
                        <ChevronDown className={cn(
                          "h-5 w-5 text-card transition-transform",
                          expandedCategory === category.id && "rotate-180"
                        )} />
                      ) : (
                        <ArrowUpRight className="h-5 w-5 text-card" />
                      )}
                    </div>
                  </div>
                </div>
              </Link>

              {/* Subcategories (for Tea) */}
              {category.subcategories && (
                <div className={cn(
                  "overflow-hidden transition-all duration-300 ease-in-out",
                  expandedCategory === category.id ? "max-h-48 mt-3" : "max-h-0"
                )}>
                  <div className="space-y-2">
                    {category.subcategories.map((sub) => (
                      <Link
                        key={sub.id}
                        to={`/shop?category=${sub.id}`}
                        className="flex items-center justify-between p-3 bg-card rounded-xl hover:bg-muted transition-colors group"
                      >
                        <div>
                          <h4 className="font-medium text-foreground group-hover:text-primary transition-colors">
                            {sub.name}
                          </h4>
                          <p className="text-xs text-muted-foreground">
                            {sub.description}
                          </p>
                        </div>
                        <ArrowUpRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
