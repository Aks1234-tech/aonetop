// import { Slider } from '@radix-ui/react-slider';
import { Leaf, Mountain, Users, Shield, ChevronLeft, ChevronRight, Award, Heart, Globe, } from 'lucide-react';
import { motion } from 'motion/react';
import { useState } from 'react';
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';


interface ArrowProps {
  onClick?: () => void;
}

function NextArrow({ onClick }: ArrowProps) {
  return (
    <button
      onClick={onClick}
      className="absolute right-[-10px] top-1/2 -translate-y-1/2 z-10 bg-white hover:bg-gray-50 rounded-full p-2 shadow-lg border border-gray-100 transition-all"
      aria-label="Next slide"
    >
      <ChevronRight className="w-6 h-6 text-[#D32F2F]" />
    </button>
  );
}

function PrevArrow({ onClick }: ArrowProps) {
  return (
    <button
      onClick={onClick}
      className="absolute left-[-10px] top-1/2 -translate-y-1/2 z-10 bg-white hover:bg-gray-50 rounded-full p-2 shadow-lg border border-gray-100 transition-all"
      aria-label="Previous slide"
    >
      <ChevronLeft className="w-6 h-6 text-[#D32F2F]" />
    </button>
  );
}

// Office collage images
const officeImages = [
  'https://images.unsplash.com/photo-1748346918817-0b1b6b2f9bab?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjBvZmZpY2UlMjB3b3Jrc3BhY2UlMjB0ZWFtfGVufDF8fHx8MTc2OTgzNDUwNXww&ixlib=rb-4.1.0&q=80&w=1080',
  'https://images.unsplash.com/photo-1686100508812-c38b3593b301?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb3Jwb3JhdGUlMjBvZmZpY2UlMjBpbnRlcmlvcnxlbnwxfHx8fDE3Njk5MjYwNTl8MA&ixlib=rb-4.1.0&q=80&w=1080',
  'https://images.unsplash.com/photo-1603201667141-5a2d4c673378?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxidXNpbmVzcyUyMHRlYW0lMjBtZWV0aW5nfGVufDF8fHx8MTc2OTg0OTA5NXww&ixlib=rb-4.1.0&q=80&w=1080',
  'https://images.unsplash.com/photo-1748346918817-0b1b6b2f9bab?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9mZXNzaW9uYWwlMjBvZmZpY2UlMjBlbnZpcm9ubWVudHxlbnwxfHx8fDE3Njk5MjYwNjB8MA&ixlib=rb-4.1.0&q=80&w=1080',
];

// Brand images (placeholder - replace with actual brand images)
const brandImages = [
    'https://images.unsplash.com/photo-1641997825978-5f8d5da5a4a1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxvcmdhbmljJTIwdGVhJTIwbGVhdmVzfGVufDF8fHx8MTc2OTg4MDkzNnww&ixlib=rb-4.1.0&q=80&w=1080',
    'https://images.unsplash.com/photo-1691480208637-6ed63aac6694?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwdXJlJTIwaG9uZXklMjBqYXJ8ZW58MXx8fHwxNzY5ODgwOTM2fDA&ixlib=rb-4.1.0&q=80&w=1080',
    'https://images.unsplash.com/photo-1573812461383-e5f8b759d12e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxnaGVlJTIwY2xhcmlmaWVkJTIwYnV0dGVyfGVufDF8fHx8MTc2OTg4MDkzN3ww&ixlib=rb-4.1.0&q=80&w=1080',
    'https://images.unsplash.com/photo-1765809255360-6ed6240bd10f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxoZXJiYWwlMjB0ZWElMjBjb2xsZWN0aW9ufGVufDF8fHx8MTc2OTg4MDkzN3ww&ixlib=rb-4.1.0&q=80&w=1080',
    'https://images.unsplash.com/photo-1730190168042-3bef4553a8f4?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxvcmdhbmljJTIwYmVla2VlcGluZyUyMGhvbmV5fGVufDF8fHx8MTc2OTg4MDkzOHww&ixlib=rb-4.1.0&q=80&w=1080',
];

const About = () => {
  const [currentBrandIndex, setCurrentBrandIndex] = useState(0);

  const brandSliderSettings = {
    dots: true,
    infinite: true,
    speed: 800,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 5000,
    cssEase: 'ease',
    pauseOnHover: true,
    nextArrow: <NextArrow />,
    prevArrow: <PrevArrow />,
    dotsClass: "slick-dots !bottom-[-30px]",
    appendDots: (dots: React.ReactNode) => (
      <div>
        <ul className="flex items-center justify-center gap-2">
          {dots}
        </ul>
      </div>
    ),
    customPaging: () => (
      <button className="w-3 h-3 rounded-full bg-gray-300 hover:bg-[#D32F2F] transition-all" />
    ),
    responsive: [
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1,
          infinite: true,
          dots: true
        }
      },
      {
        breakpoint: 600,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1,
          initialSlide: 1
        }
      },
      {
        breakpoint: 480,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1
        }
      }
    ]
  };

  const nextBrand = () => {
    setCurrentBrandIndex((prev) => (prev + 1) % brandImages.length);
  };

  const prevBrand = () => {
    setCurrentBrandIndex((prev) => (prev - 1 + brandImages.length) % brandImages.length);
  };

  return (

    <div className="min-h-[screen] bg-background">
      {/* Hero */}
      <section className="relative h-[300px] overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1690986375486-460dc48dd499?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxvcmdhbmljJTIwdGVhJTIwbGVhdmVzfGVufDF8fHx8MTc2OTg3ODU3NXww&ixlib=rb-4.1.0&q=80&w=1080"
            alt="Tractor in field"
            className="w-full h-full object-cover"
          />
          {/* Dark Overlay */}
          <div className="absolute inset-0 bg-black/50" />
        </div>

        {/* Content */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-4">
              About 9 Planet Impex
            </h1>
            <p className="text-xl text-white/90 max-w-2xl mx-auto">
              Bringing nature's finest organic products to your doorstep since 2015
            </p>
          </div>
        </div>
      </section>

      {/* Our Story */}
      <section className="py-16 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
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

      {/* Our Brands Carousel */}
      <section className="py-16 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="font-display text-3xl sm:text-4xl font-semibold text-foreground mb-4">
              Our Brands
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Trusted brands delivering premium quality products
            </p>
          </div>
          <div className="brand-slider pb-8 max-w-4xl mx-auto">
            <Slider {...brandSliderSettings}>
              {brandImages.map((brand, index) => (
                <div key={index} className="px-0">
                  <div className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-shadow duration-300">
                    <img
                      src={brand}
                      alt={`Brand ${index + 1}`}
                      className="w-full h-[400px] object-cover"
                    />
                  </div>
                </div>
              ))}
            </Slider>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-16 sm:py-18 bg-muted/50">
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
