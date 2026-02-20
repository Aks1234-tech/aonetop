import { Leaf, Mountain, Users, Award, Heart, Globe } from 'lucide-react';

const About = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <section className="relative py-20 bg-gradient-hero text-primary-foreground overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 right-20 w-96 h-96 rounded-full bg-gold/30 blur-3xl" />
        </div>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <span className="inline-block px-4 py-1.5 bg-gold/20 text-gold text-sm font-medium rounded-full mb-6">
              Our Story
            </span>
            <h1 className="font-display text-4xl sm:text-5xl font-semibold mb-6">
              A Legacy of Excellence in Tea
            </h1>
            <p className="text-xl text-primary-foreground/80 leading-relaxed">
              For over 25 years, 9 Planet Impex has been dedicated to sourcing and 
              sharing the finest teas from India's legendary gardens.
            </p>
          </div>
        </div>
      </section>

      {/* Story */}
      <section className="py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="font-display text-3xl sm:text-4xl font-semibold text-foreground mb-6">
                From Humble Beginnings to Premium Excellence
              </h2>
              <div className="space-y-4 text-muted-foreground leading-relaxed">
                <p>
                  Founded in 1998 by Rajesh Sharma, 9 Planet Impex began as a small 
                  family business with a simple mission: to bring the authentic taste 
                  of Indian teas to discerning customers worldwide.
                </p>
                <p>
                  What started as a modest operation in Darjeeling has grown into a 
                  trusted name in premium tea sourcing. We've maintained our core values 
                  of quality, authenticity, and sustainability throughout our journey.
                </p>
                <p>
                  Today, we partner directly with over 50 tea estates across Darjeeling, 
                  Assam, Nilgiri, and other renowned tea-growing regions. Each relationship 
                  is built on mutual respect, fair trade practices, and a shared commitment 
                  to excellence.
                </p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <img
                src="https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=400&q=80"
                alt="Tea garden"
                className="rounded-2xl shadow-elevated"
              />
              <img
                src="https://images.unsplash.com/photo-1571934811356-5cc061b6821f?w=400&q=80"
                alt="Tea processing"
                className="rounded-2xl shadow-elevated mt-8"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-20 bg-muted/50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="font-display text-3xl sm:text-4xl font-semibold text-foreground mb-4">
              Our Core Values
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              These principles guide everything we do, from sourcing to customer service.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-card p-8 rounded-2xl shadow-soft">
              <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-6">
                <Leaf className="h-7 w-7 text-primary" />
              </div>
              <h3 className="font-display text-xl font-semibold text-foreground mb-3">
                Quality First
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                We never compromise on quality. Every tea is personally selected and 
                tested to ensure it meets our exacting standards.
              </p>
            </div>

            <div className="bg-card p-8 rounded-2xl shadow-soft">
              <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-6">
                <Globe className="h-7 w-7 text-primary" />
              </div>
              <h3 className="font-display text-xl font-semibold text-foreground mb-3">
                Sustainability
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                We're committed to environmental responsibility, partnering only with 
                estates that practice sustainable farming methods.
              </p>
            </div>

            <div className="bg-card p-8 rounded-2xl shadow-soft">
              <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-6">
                <Users className="h-7 w-7 text-primary" />
              </div>
              <h3 className="font-display text-xl font-semibold text-foreground mb-3">
                Fair Trade
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                We ensure fair prices for tea farmers and workers, supporting the 
                communities that make our teas possible.
              </p>
            </div>

            <div className="bg-card p-8 rounded-2xl shadow-soft">
              <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-6">
                <Mountain className="h-7 w-7 text-primary" />
              </div>
              <h3 className="font-display text-xl font-semibold text-foreground mb-3">
                Direct Sourcing
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                By working directly with tea estates, we ensure freshness and 
                authenticity while supporting growers.
              </p>
            </div>

            <div className="bg-card p-8 rounded-2xl shadow-soft">
              <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-6">
                <Award className="h-7 w-7 text-primary" />
              </div>
              <h3 className="font-display text-xl font-semibold text-foreground mb-3">
                Authenticity
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                Every tea we sell is 100% authentic, traceable to its source, and 
                represents the true character of its origin.
              </p>
            </div>

            <div className="bg-card p-8 rounded-2xl shadow-soft">
              <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-6">
                <Heart className="h-7 w-7 text-primary" />
              </div>
              <h3 className="font-display text-xl font-semibold text-foreground mb-3">
                Customer Love
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                Our customers are family. We're dedicated to providing exceptional 
                service and sharing our passion for tea.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="font-display text-3xl sm:text-4xl font-semibold text-foreground mb-4">
              The People Behind the Cup
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Meet the passionate team that brings you the finest teas from India.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="w-32 h-32 rounded-full bg-muted mx-auto mb-4 overflow-hidden">
                <img
                  src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&q=80"
                  alt="Rajesh Sharma"
                  className="w-full h-full object-cover"
                />
              </div>
              <h3 className="font-display text-lg font-semibold text-foreground">
                Rajesh Sharma
              </h3>
              <p className="text-muted-foreground">Founder & CEO</p>
            </div>

            <div className="text-center">
              <div className="w-32 h-32 rounded-full bg-muted mx-auto mb-4 overflow-hidden">
                <img
                  src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&q=80"
                  alt="Priya Sharma"
                  className="w-full h-full object-cover"
                />
              </div>
              <h3 className="font-display text-lg font-semibold text-foreground">
                Priya Sharma
              </h3>
              <p className="text-muted-foreground">Head of Curation</p>
            </div>

            <div className="text-center">
              <div className="w-32 h-32 rounded-full bg-muted mx-auto mb-4 overflow-hidden">
                <img
                  src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&q=80"
                  alt="Amit Patel"
                  className="w-full h-full object-cover"
                />
              </div>
              <h3 className="font-display text-lg font-semibold text-foreground">
                Amit Patel
              </h3>
              <p className="text-muted-foreground">Master Tea Sommelier</p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-20 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <p className="font-display text-4xl sm:text-5xl font-bold text-gold">25+</p>
              <p className="text-primary-foreground/80 mt-2">Years of Excellence</p>
            </div>
            <div>
              <p className="font-display text-4xl sm:text-5xl font-bold text-gold">50+</p>
              <p className="text-primary-foreground/80 mt-2">Partner Estates</p>
            </div>
            <div>
              <p className="font-display text-4xl sm:text-5xl font-bold text-gold">10K+</p>
              <p className="text-primary-foreground/80 mt-2">Happy Customers</p>
            </div>
            <div>
              <p className="font-display text-4xl sm:text-5xl font-bold text-gold">50+</p>
              <p className="text-primary-foreground/80 mt-2">Tea Varieties</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;
