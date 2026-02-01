import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Carousel, CarouselContent, CarouselItem, type CarouselApi } from '@/components/ui/carousel';
import Autoplay from 'embla-carousel-autoplay';
import { useEffect, useState } from 'react';

const heroSlides = [
  {
    id: 1,
    title: 'Premium Organic Tea',
    subtitle: 'Handpicked from the finest plantations',
    buttonText: 'Explore Tea Collection',
    buttonLink: '/shop?category=tea',
    backgroundImage: 'https://images.unsplash.com/photo-1564890369478-c89ca6d9cde9?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w0OTExMzJ8MHwxfHNlYXJjaHwxfHx0ZWElMjBwbGFudGF0aW9uJTIwZ3JlZW4lMjBsZWF2ZXN8ZW58MHx8fHwxNzM4Mzk4NDU5fDA&ixlib=rb-4.0.3&q=80&w=1920',
  },
  {
    id: 2,
    title: 'Pure Golden Ghee',
    subtitle: 'Traditional purity in every jar',
    buttonText: 'Discover Ghee',
    buttonLink: '/shop?category=ghee',
    backgroundImage: 'https://images.unsplash.com/photo-1736752346246-61f4daedfde0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhcnRpc2FuJTIwZ2hlZSUyMGJ1dHRlcnxlbnwxfHx8fDE3Njk3OTMxNTJ8MA&ixlib=rb-4.1.0&q=80&w=1080',
  },
  {
    id: 3,
    title: '100% Raw Natural Honey',
    subtitle: 'Sweet essence from nature',
    buttonText: 'Shop Honey',
    buttonLink: '/shop?category=honey',
    backgroundImage: 'https://images.unsplash.com/photo-1760447528604-7878bb0940eb?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxob25leSUyMGphciUyMHdvb2RlbiUyMGJhY2tncm91bmR8ZW58MXx8fHwxNzY5NjcyNjk2fDA&ixlib=rb-4.1.0&q=80&w=1080',
  },
];

export function Hero() {
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    if (!api) {
      return;
    }

    setCurrent(api.selectedScrollSnap());

    api.on('select', () => {
      setCurrent(api.selectedScrollSnap());
    });
  }, [api]);

  const scrollTo = (index: number) => {
    api?.scrollTo(index);
  };

  return (
    <section className="relative min-h-screen flex items-center overflow-hidden">
      <Carousel
        setApi={setApi}
        className="w-full h-screen"
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
              <div className="relative h-screen flex items-center">
                {/* Background Image with Overlay */}
                <div className="absolute inset-0">
                  <img
                    src={slide.backgroundImage}
                    alt={slide.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/40" />
                </div>

                {/* Content */}
                <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                  <div className="max-w-2xl">
                    <h1 className="font-display text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-semibold text-white leading-tight mb-4 sm:mb-6 animate-fade-up">
                      {slide.title}
                    </h1>

                    <p className="text-lg sm:text-xl lg:text-2xl text-white/90 mb-6 sm:mb-8 leading-relaxed animate-fade-up" style={{ animationDelay: '0.1s' }}>
                      {slide.subtitle}
                    </p>

                    <div className="animate-fade-up" style={{ animationDelay: '0.2s' }}>
                      <Button
                        variant="default"
                        size="xl"
                        asChild
                        className="bg-red-600 hover:bg-red-700 text-white font-medium px-6 py-3 rounded text-base"
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

        {/* Navigation Arrows */}
        <button
          onClick={() => api?.scrollPrev()}
          className="absolute left-4 sm:left-6 top-1/2 -translate-y-1/2 z-20 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-sm flex items-center justify-center transition-all group"
          aria-label="Previous slide"
        >
          <ChevronLeft className="w-6 h-6 sm:w-7 sm:h-7 text-white group-hover:scale-110 transition-transform" />
        </button>

        <button
          onClick={() => api?.scrollNext()}
          className="absolute right-4 sm:right-6 top-1/2 -translate-y-1/2 z-20 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-sm flex items-center justify-center transition-all group"
          aria-label="Next slide"
        >
          <ChevronRight className="w-6 h-6 sm:w-7 sm:h-7 text-white group-hover:scale-110 transition-transform" />
        </button>

        {/* Indicator Dots */}
        <div className="absolute bottom-8 sm:bottom-12 left-1/2 -translate-x-1/2 z-20 flex gap-2">
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
        </div>
      </Carousel>

      {/* Bottom Wave */}
      <div className="absolute -bottom-1 left-0 right-0 pointer-events-none z-10">
        <svg viewBox="0 0 1440 150" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-[100px] sm:h-[120px] lg:h-[150px]" preserveAspectRatio="none">
          <path
            d="M0 150L60 130C120 110 240 70 360 50C480 30 600 30 720 40C840 50 960 70 1080 80C1200 90 1320 90 1380 90L1440 90V150H1380C1320 150 1200 150 1080 150C960 150 840 150 720 150C600 150 480 150 360 150C240 150 120 150 60 150H0Z"
            fill="hsl(var(--background))"
          />
        </svg>
      </div>
    </section>
  );
}
