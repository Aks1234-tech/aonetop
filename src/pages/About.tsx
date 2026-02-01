import { Leaf, Mountain, Users, Shield, ChevronLeft, ChevronRight, Award, Heart, Globe, } from 'lucide-react';
import { motion } from 'motion/react';
// import Slider from 'react-slick';
// import 'slick-carousel/slick/slick.css';
// import 'slick-carousel/slick/slick-theme.css';

// Office collage images
const officeImages = [
  'https://images.unsplash.com/photo-1748346918817-0b1b6b2f9bab?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjBvZmZpY2UlMjB3b3Jrc3BhY2UlMjB0ZWFtfGVufDF8fHx8MTc2OTgzNDUwNXww&ixlib=rb-4.1.0&q=80&w=1080',
  'https://images.unsplash.com/photo-1686100508812-c38b3593b301?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb3Jwb3JhdGUlMjBvZmZpY2UlMjBpbnRlcmlvcnxlbnwxfHx8fDE3Njk5MjYwNTl8MA&ixlib=rb-4.1.0&q=80&w=1080',
  'https://images.unsplash.com/photo-1603201667141-5a2d4c673378?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxidXNpbmVzcyUyMHRlYW0lMjBtZWV0aW5nfGVufDF8fHx8MTc2OTg0OTA5NXww&ixlib=rb-4.1.0&q=80&w=1080',
  'https://images.unsplash.com/photo-1748346918817-0b1b6b2f9bab?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9mZXNzaW9uYWwlMjBvZmZpY2UlMjBlbnZpcm9ubWVudHxlbnwxfHx8fDE3Njk5MjYwNjB8MA&ixlib=rb-4.1.0&q=80&w=1080',
];

// Brand images (placeholder - replace with actual brand images)
const brandImages = [
  '/home/hackycoder/.gemini/antigravity/brain/5d1acf63-0fbf-45d1-84a7-e0b48f84fd70/tea_brand_logo_1769931536447.png',
  '/home/hackycoder/.gemini/antigravity/brain/5d1acf63-0fbf-45d1-84a7-e0b48f84fd70/honey_brand_logo_1769931551996.png',
  '/home/hackycoder/.gemini/antigravity/brain/5d1acf63-0fbf-45d1-84a7-e0b48f84fd70/ghee_brand_logo_1769931568502.png',
  '/home/hackycoder/.gemini/antigravity/brain/5d1acf63-0fbf-45d1-84a7-e0b48f84fd70/organic_tea_brand_1769931587533.png',
  '/home/hackycoder/.gemini/antigravity/brain/5d1acf63-0fbf-45d1-84a7-e0b48f84fd70/premium_spice_brand_1769931601706.png',
];

const About = () => {
  return (

    <div className="min-h-[screen] bg-background">
      {/* Hero */}
      <section className="relative py-20 overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1690986375486-460dc48dd499?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxvcmdhbmljJTIwdGVhJTIwbGVhdmVzfGVufDF8fHx8MTc2OTg3ODU3NXww&ixlib=rb-4.1.0&q=80&w=1080"
            alt="Tractor in field"
            className="relative w-full h-full object-cover"
          />
          {/* Dark Overlay */}
          <div className="absolute inset-0 bg-black/50" />
        </div>

        {/* Content */}
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="absolute inset-0 bg-gradient-to-r from-black/70 to-black/40 flex items-center">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-4">
                About 9 Planet Impex
              </h1>
              <p className="text-xl text-white/90 max-w-2xl">
                Bringing nature's finest organic products to your doorstep since 2015
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Our Story */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-start">
            {/* Left: Story Text */}
            <div>
              <h2 className="font-display text-3xl sm:text-4xl font-semibold text-foreground mb-6">
                Our Story
              </h2>
              <div className="space-y-4 text-muted-foreground leading-relaxed">
                <p>
                  9 Planet Impex was founded with a simple yet powerful mission: to make
                  premium, organic products accessible to everyone who values health,
                  quality, and sustainability.
                </p>
                <p>
                  Our journey began in 2015 when our founder, inspired by traditional farming
                  practices and the purity of natural products, decided to bridge the gap
                  between organic farmers and conscious consumers.
                </p>
                <p>
                  Today, we work directly with certified organic farms across the country,
                  ensuring that every product that bears our name meets the highest
                  standards of quality and purity. From the tea estates of Darjeeling to the
                  honey farms of the Himalayas, we bring you nature's best.
                </p>
                <p>
                  Our name, "9 Planet," symbolizes our commitment to harmony with nature
                  and the universe. Just as planets orbit in perfect balance, we believe in
                  maintaining balance between quality, sustainability, and affordability.
                </p>
              </div>
            </div>
            {/* Animated Collage */}
            <div className="relative h-[500px] w-[500px]">
              <div className="grid grid-cols-2 gap-4 h-full">
                {officeImages.map((img, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, scale: 0.8 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5, delay: index * 0.2 }}
                    viewport={{ once: true }}
                    className={`relative rounded-xl overflow-hidden shadow-lg ${index === 0 ? 'col-span-2' : ''
                      } ${index === 3 ? 'col-span-2' : ''}`}
                  >
                    <img
                      src={img}
                      alt={`Office ${index + 1}`}
                      className="w-full h-full object-cover hover:scale-110 transition-transform duration-500"
                    />
                  </motion.div>
                ))}
              </div>
              <div className="absolute -bottom-6 -right-6 bg-[#D32F2F] text-white p-6 rounded-xl shadow-xl hidden sm:block">
                <p className="text-4xl font-bold mb-1">10+</p>
                <p className="text-sm">Years of Excellence</p>
              </div>
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
