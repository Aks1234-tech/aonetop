import { Link } from 'react-router-dom';
import { ArrowRight, Building2, Package, Truck, HeartHandshake } from 'lucide-react';
import { Button } from '@/components/ui/button';

const benefits = [
  {
    icon: Package,
    title: 'Bulk Pricing',
    description: 'Competitive rates for large orders',
  },
  {
    icon: Building2,
    title: 'Private Labeling',
    description: 'Custom branding options available',
  },
  {
    icon: Truck,
    title: 'Reliable Supply',
    description: 'Consistent quality & timely delivery',
  },
  {
    icon: HeartHandshake,
    title: 'Dedicated Support',
    description: 'Personal account management',
  },
];

export function BulkOrdersTeaser() {
  return (
    <section className="py-20 bg-muted/50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-primary rounded-3xl overflow-hidden">
          <div className="grid lg:grid-cols-2">
            {/* Content */}
            <div className="p-8 lg:p-12 text-primary-foreground">
              <span className="inline-block px-4 py-1.5 bg-gold/20 text-gold text-sm font-medium rounded-full mb-6">
                B2B Partnership
              </span>
              <h2 className="font-display text-3xl sm:text-4xl font-semibold mb-4">
                Bulk Orders &<br />Business Solutions
              </h2>
              <p className="text-primary-foreground/80 leading-relaxed mb-8 max-w-md">
                Are you a hotel, restaurant, cafe, or retailer? Partner with us for 
                premium tea supplies with competitive bulk pricing and dedicated support.
              </p>

              {/* Benefits Grid */}
              <div className="grid sm:grid-cols-2 gap-6 mb-8">
                {benefits.map((benefit) => (
                  <div key={benefit.title} className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-lg bg-primary-foreground/10 flex items-center justify-center shrink-0">
                      <benefit.icon className="h-5 w-5 text-gold" />
                    </div>
                    <div>
                      <p className="font-semibold">{benefit.title}</p>
                      <p className="text-sm text-primary-foreground/70">{benefit.description}</p>
                    </div>
                  </div>
                ))}
              </div>

              <Button variant="gold" size="lg" asChild>
                <Link to="/bulk-orders" className="group">
                  Get a Quote
                  <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                </Link>
              </Button>
            </div>

            {/* Image */}
            <div className="relative hidden lg:block">
              <img
                src="https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=800&q=80"
                alt="Bulk tea orders"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-primary/80 to-transparent" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
