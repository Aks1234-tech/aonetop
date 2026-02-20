// import { Slider } from '@radix-ui/react-slider';
import { Leaf, Mountain, Users, Shield, ChevronLeft, ChevronRight, Award, Heart, Globe, } from 'lucide-react';
import { motion } from 'motion/react';
import { useState } from 'react';
import Slider from 'react-slick';
// import 'slick-carousel/slick/slick.css';
// import 'slick-carousel/slick/slick-theme.css';
import Autoplay from "embla-carousel-autoplay";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";


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
  'https://zhwwybsuomutemjojcht.supabase.co/storage/v1/object/public/office-images/business_Office_1.png  ',
  'https://zhwwybsuomutemjojcht.supabase.co/storage/v1/object/public/office-images/business_Office_2.png',
  'https://zhwwybsuomutemjojcht.supabase.co/storage/v1/object/public/office-images/Office_1.jpeg',
  'https://zhwwybsuomutemjojcht.supabase.co/storage/v1/object/public/office-images/Office_2.jpeg',
  'https://zhwwybsuomutemjojcht.supabase.co/storage/v1/object/public/office-images/Office_3.jpeg',
  'https://zhwwybsuomutemjojcht.supabase.co/storage/v1/object/public/office-images/Office_4.jpeg',
];

import { useSiteContent } from '@/hooks/useSiteContent';

const About = () => {
  const { data: content } = useSiteContent();
  console.log('[AboutPage] Received content:', content);
  const brandImages = content?.brandImages || [];

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
            src="https://zhwwybsuomutemjojcht.supabase.co/storage/v1/object/public/content-images/about_top.jpeg"
            alt="About Top Background"
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
            {/* Animated Carousel */}
            <div className="relative w-full max-w-[500px] aspect-square mx-auto lg:mx-0">
              <Carousel
                opts={{
                  loop: true,
                }}
                plugins={[
                  Autoplay({
                    delay: 2000,
                  }),
                ]}
                className="w-full h-full"
              >
                <CarouselContent className="h-full">
                  {officeImages.map((img, index) => (
                    <CarouselItem key={index} className="h-full">
                      <div className="p-1 h-full">
                        <div className="overflow-hidden rounded-xl h-full shadow-lg relative aspect-square">
                          <img
                            src={img}
                            alt={`Office ${index + 1}`}
                            className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                          />
                        </div>
                      </div>
                    </CarouselItem>
                  ))}
                </CarouselContent>
                <CarouselPrevious className="left-2" />
                <CarouselNext className="right-2" />
              </Carousel>

              {/* <div className="absolute -bottom-4 -right-4 sm:-bottom-6 sm:-right-6 bg-[#D32F2F] text-white p-4 sm:p-6 rounded-xl shadow-xl z-20">
                <p className="text-3xl sm:text-4xl font-bold mb-1">10+</p>
                <p className="text-xs sm:text-sm">Years of Excellence</p>
              </div> */}
            </div>
          </div>
        </div>
      </section>

      {/* Our Brands Carousel */}
      <section className="py-14 sm:py-18 bg-muted/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="font-display text-3xl sm:text-4xl font-semibold text-foreground mb-4">
              Our Brands
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Trusted brands delivering premium quality products
            </p>
          </div>
          <div className="brand-slider pb-8 max-w-5xl mx-auto">
            <Slider {...brandSliderSettings}>
              {brandImages.map((brand, index) => (
                <div key={index} className="px-0">
                  <div className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-shadow duration-300 h-[350px] w-full flex items-center justify-center p-8">
                    <img
                      src={brand}
                      alt={`Brand ${index + 1}`}
                      className="w-full h-full object-contain hover:scale-105 transition-transform duration-500"
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

      {/* Certifications Section */}
      <div className="bg-gray-50 py-16 sm:py-18">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Our Certifications
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Trusted certifications that validate our commitment to quality
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
              className="bg-white p-8 rounded-xl shadow-md text-center hover:shadow-xl transition-shadow duration-300"
            >
              <Shield className="w-16 h-16 text-[#D32F2F] mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-2">IEC Certified</h3>
              <p className="text-gray-600">Certified organic by the United States Department of Agriculture</p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              viewport={{ once: true }}
              className="bg-white p-8 rounded-xl shadow-md text-center hover:shadow-xl transition-shadow duration-300"
            >
              <Leaf className="w-16 h-16 text-green-600 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-2">FSSAI Certified</h3>
              <p className="text-gray-600">Supporting fair wages and ethical treatment of farmers</p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              viewport={{ once: true }}
              className="bg-white p-8 rounded-xl shadow-md text-center hover:shadow-xl transition-shadow duration-300"
            >
              <Award className="w-16 h-16 text-amber-600 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-2">ISO Certified</h3>
              <p className="text-gray-600">International standards for quality management systems</p>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;
