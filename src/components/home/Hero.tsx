import { Link } from 'react-router-dom';
// import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Carousel, CarouselContent, CarouselItem, type CarouselApi } from '@/components/ui/carousel';
import Autoplay from 'embla-carousel-autoplay';
import { useEffect, useState } from 'react';

import { useSiteContent } from '@/hooks/useSiteContent';

export function Hero() {
  const { data: content, isLoading } = useSiteContent();
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);

  const heroSlides = content?.heroSlides || [];


  useEffect(() => {
    if (!api) {
      return;
    }

    setCurrent(api.selectedScrollSnap());

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          {/* Content */}
          <div className="text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gold/20 border border-gold/30 mb-4 sm:mb-6 animate-fade-up">
              <Leaf className="h-4 w-4 text-gold flex-shrink-0" />
              <span className="text-sm font-medium text-gold whitespace-nowrap">100% Organic & Ethical</span>
            </div>

            <h1 className="font-display text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-semibold text-primary-foreground leading-tight mb-4 sm:mb-6 animate-fade-up" style={{ animationDelay: '0.1s' }}>
              Discover the
              <span className="block text-gold">Art of Tea</span>
            </h1>

  /* DEBUG LOG */
  console.log('[Hero] Render. Content loaded:', !!content, 'Slides:', heroSlides.length);
  useEffect(() => {
    console.log('[Hero] Slides data:', heroSlides);
  }, [heroSlides]);

  return (
    <section className="relative min-h-[400px] sm:min-h-[500px] lg:min-h-[600px] flex items-center overflow-hidden">
      <Carousel
        key={heroSlides.map(s => s.backgroundImage).join('-')} /* Force re-init on image change */
        setApi={setApi}
        className="w-full h-[400px] sm:h-[500px] lg:h-[600px]"
        opts={{
          loop: true,
        }}
        plugins={[
          Autoplay({
            delay: 5000,
          }),
        ]}
      >
        <CarouselContent className="ml-0">
          {heroSlides.map((slide) => (
            <CarouselItem key={slide.id} className="pl-0">
              <div className="relative h-[400px] sm:h-[500px] lg:h-[600px] flex items-center">
                {/* Background Image with Overlay */}
                <div className="absolute inset-0 overflow-hidden">
                  <img
                    src={slide.backgroundImage}
                    alt={slide.title}
                    className="w-full h-full object-cover object-center"
                  />
                  {/* <div className="relative inset-0 bg-gradient-to-r from-black/80 via-black/50 to-transparent sm:bg-black/40" /> */}
                </div>

                {/* Content Overlay - Centered over the image */}
                <div className="absolute inset-0 flex items-center justify-start container mx-auto px-6 sm:px-8 lg:px-12 z-10 pointer-events-none">
                  <div className="max-w-[40%] sm:max-w-[60%] lg:max-w-[50%] text-left w-full pointer-events-auto">
                    <h1 className="font-display text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-semibold text-white leading-tight mb-4 sm:mb-6 animate-fade-up">
                      {slide.title}
                    </h1>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 sm:gap-8 mt-8 sm:mt-12 pt-6 sm:pt-8 border-t border-primary-foreground/20 animate-fade-up" style={{ animationDelay: '0.4s' }}>
              <div>
                <p className="font-display text-2xl sm:text-3xl font-bold text-gold">50+</p>
                <p className="text-xs sm:text-sm text-primary-foreground/70">Tea Varieties</p>
              </div>
              <div>
                <p className="font-display text-2xl sm:text-3xl font-bold text-gold">25+</p>
                <p className="text-xs sm:text-sm text-primary-foreground/70">Years Legacy</p>
              </div>
              <div>
                <p className="font-display text-2xl sm:text-3xl font-bold text-gold">10K+</p>
                <p className="text-xs sm:text-sm text-primary-foreground/70">Happy Customers</p>
              </div>
            </div>
          </div>

                    <div className="animate-fade-up" style={{ animationDelay: '0.2s' }}>
                      <Button
                        variant="default"
                        size="xl"
                        asChild
                        className="bg-red-600 hover:bg-red-700 text-white font-medium px-4 py-3 rounded text-sm sm:text-base pointer-events-auto"
                      >
                        <Link to={slide.buttonLink}>
                          {slide.buttonText}
                        </Link>
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>

        {/* Navigation Arrows
        <button
          onClick={() => api?.scrollPrev()}
          className="absolute left-4 sm:left-6 top-1/2 -translate-y-1/2 z-20 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-sm hidden sm:flex items-center justify-center transition-all group"
          aria-label="Previous slide"
        >
          <ChevronLeft className="w-6 h-6 sm:w-7 sm:h-7 text-white group-hover:scale-110 transition-transform" />
        </button>

        <button
          onClick={() => api?.scrollNext()}
          className="absolute right-4 sm:right-6 top-1/2 -translate-y-1/2 z-20 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-sm hidden sm:flex items-center justify-center transition-all group"
          aria-label="Next slide"
        >
          <ChevronRight className="w-6 h-6 sm:w-7 sm:h-7 text-white group-hover:scale-110 transition-transform" />
        </button> */}

        {/* Indicator Dots */}
        {/* <div className="absolute bottom-16 sm:bottom-12 left-1/2 -translate-x-1/2 z-20 flex gap-2">
          {heroSlides.map((_, index) => (
            <button
              key={index}
              onClick={() => scrollTo(index)}
              className={`transition-all ${current === index
                ? 'w-8 h-2 bg-white'
                : 'w-2 h-2 bg-white/50 hover:bg-white/70'
                } rounded-full`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div> */}
      </Carousel>

      {/* Bottom Wave */}
      <div className="absolute -bottom-5 -left-20 right-0 pointer-events-none z-10">
        <svg viewBox="0 0 1440 150" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-[50px] sm:h-[120px] lg:h-[150px]" preserveAspectRatio="none">
          <path
            d="M0 150L60 130C120 110 240 70 360 50C480 30 600 30 720 40C840 50 960 70 1080 80C1200 90 1320 90 1380 90L1440 90V150H1380C1320 150 1200 150 1080 150C960 150 840 150 720 150C600 150 480 150 360 150C240 150 120 150 60 150H0Z"
            fill="hsl(var(--background))"
          />
        </svg>
      </div>
    </section>
  );
}
