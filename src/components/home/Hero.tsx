import { Link } from 'react-router-dom';
import { ArrowRight, Leaf } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function Hero() {
  return (
    <section className="relative min-h-[90vh] flex items-center bg-gradient-hero overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-20 left-10 w-64 h-64 rounded-full bg-gold/30 blur-3xl animate-float" />
        <div className="absolute bottom-20 right-10 w-96 h-96 rounded-full bg-emerald-light/20 blur-3xl animate-float" style={{ animationDelay: '2s' }} />
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Content */}
          <div className="text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gold/20 border border-gold/30 mb-6 animate-fade-up">
              <Leaf className="h-4 w-4 text-gold" />
              <span className="text-sm font-medium text-gold">100% Organic & Ethical</span>
            </div>
            
            <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-semibold text-primary-foreground leading-tight mb-6 animate-fade-up" style={{ animationDelay: '0.1s' }}>
              Discover the
              <span className="block text-gold">Art of Tea</span>
            </h1>
            
            <p className="text-lg sm:text-xl text-primary-foreground/80 max-w-xl mx-auto lg:mx-0 mb-8 leading-relaxed animate-fade-up" style={{ animationDelay: '0.2s' }}>
              Handpicked from India's finest tea gardens, our premium collection brings you 
              the authentic taste of tradition in every cup.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start animate-fade-up" style={{ animationDelay: '0.3s' }}>
              <Button variant="gold" size="xl" asChild>
                <Link to="/shop" className="group">
                  Explore Collection
                  <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                </Link>
              </Button>
              <Button variant="hero-outline" size="xl" asChild>
                <Link to="/about">Our Story</Link>
              </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-8 mt-12 pt-8 border-t border-primary-foreground/20 animate-fade-up" style={{ animationDelay: '0.4s' }}>
              <div>
                <p className="font-display text-3xl font-bold text-gold">50+</p>
                <p className="text-sm text-primary-foreground/70">Tea Varieties</p>
              </div>
              <div>
                <p className="font-display text-3xl font-bold text-gold">25+</p>
                <p className="text-sm text-primary-foreground/70">Years Legacy</p>
              </div>
              <div>
                <p className="font-display text-3xl font-bold text-gold">10K+</p>
                <p className="text-sm text-primary-foreground/70">Happy Customers</p>
              </div>
            </div>
          </div>

          {/* Hero Image */}
          <div className="relative hidden lg:block animate-fade-up" style={{ animationDelay: '0.2s' }}>
            <div className="relative w-full aspect-square max-w-lg mx-auto">
              <div className="absolute inset-0 rounded-full bg-gold/20 blur-3xl" />
              <img
                src="https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=800&q=80"
                alt="Premium tea leaves"
                className="relative z-10 w-full h-full object-cover rounded-3xl shadow-2xl"
              />
              {/* Floating Badge */}
              <div className="absolute -bottom-6 -left-6 bg-card rounded-2xl p-4 shadow-elevated z-20 animate-float">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-emerald flex items-center justify-center">
                    <Leaf className="h-6 w-6 text-primary-foreground" />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">Certified Organic</p>
                    <p className="text-sm text-muted-foreground">100% Natural</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Wave */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
          <path
            d="M0 120L60 105C120 90 240 60 360 45C480 30 600 30 720 37.5C840 45 960 60 1080 67.5C1200 75 1320 75 1380 75L1440 75V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z"
            fill="hsl(var(--background))"
          />
        </svg>
      </div>
    </section>
  );
}
