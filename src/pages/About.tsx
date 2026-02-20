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
  return (

    <div className="min-h-[screen] bg-background">
      {/* Hero */}
      <section className="relative py-20 bg-gradient-hero text-primary-foreground overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 right-20 w-96 h-96 rounded-full bg-gold/30 blur-3xl" />
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
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Our Certifications
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Trusted certifications that validate our commitment to quality
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
      </div>
    </div>
  );
};

export default About;
