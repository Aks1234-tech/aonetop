import { Link } from 'react-router-dom';
import { ArrowRight, Leaf, Mountain, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function AboutPreview() {
  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Image Grid */}
          <div className="relative">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-4">
                <img
                  src="https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=400&q=80"
                  alt="Tea plantation"
                  className="rounded-2xl shadow-elevated animate-fade-up"
                />
                <img
                  src="https://images.unsplash.com/photo-1571934811356-5cc061b6821f?w=400&q=80"
                  alt="Tea processing"
                  className="rounded-2xl shadow-elevated animate-fade-up"
                  style={{ animationDelay: '0.2s' }}
                />
              </div>
              <div className="pt-8">
                <img
                  src="https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=400&q=80"
                  alt="Premium tea leaves"
                  className="rounded-2xl shadow-elevated animate-fade-up"
                  style={{ animationDelay: '0.1s' }}
                />
              </div>
            </div>
            {/* Floating Badge */}
            <div className="absolute -bottom-6 -right-6 bg-primary rounded-2xl p-5 shadow-elevated animate-float hidden sm:block">
              <div className="text-center text-primary-foreground">
                <p className="font-display text-3xl font-bold">25+</p>
                <p className="text-sm text-primary-foreground/80">Years of<br />Excellence</p>
              </div>
            </div>
          </div>

          {/* Content */}
          <div>
            <span className="text-accent font-medium tracking-widest uppercase text-sm">
              Our Story
            </span>
            <h2 className="font-display text-3xl sm:text-4xl font-semibold text-foreground mt-2 mb-6">
              From Estate to Cup,<br />
              <span className="text-primary">A Journey of Passion</span>
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-6">
              Founded in 1998, 9 Planet Impex began with a simple mission: to share the 
              authentic taste of India's finest teas with the world. What started as a 
              small family venture has grown into a trusted name in premium tea sourcing.
            </p>
            <p className="text-muted-foreground leading-relaxed mb-8">
              We partner directly with tea estates across Darjeeling, Assam, Nilgiri, and 
              beyond, ensuring every leaf meets our exacting standards for quality, 
              sustainability, and ethical sourcing.
            </p>

            {/* Key Points */}
            <div className="grid sm:grid-cols-3 gap-6 mb-8">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center shrink-0">
                  <Leaf className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-semibold text-foreground">Organic</p>
                  <p className="text-sm text-muted-foreground">Certified farms</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center shrink-0">
                  <Mountain className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-semibold text-foreground">Direct</p>
                  <p className="text-sm text-muted-foreground">From estates</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center shrink-0">
                  <Users className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-semibold text-foreground">Fair Trade</p>
                  <p className="text-sm text-muted-foreground">Ethical sourcing</p>
                </div>
              </div>
            </div>

            <Button variant="default" size="lg" asChild>
              <Link to="/about" className="group">
                Learn More About Us
                <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
