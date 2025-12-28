import { Star, Quote } from 'lucide-react';

const reviews = [
  {
    id: 1,
    name: 'Priya Sharma',
    location: 'Mumbai',
    rating: 5,
    text: 'The Darjeeling First Flush is absolutely divine. The muscatel notes are so pronounced and the quality is unmatched. Best tea I\'ve ever had!',
    product: 'Darjeeling First Flush',
    image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&q=80',
  },
  {
    id: 2,
    name: 'Rahul Mehta',
    location: 'Delhi',
    rating: 5,
    text: 'As a chai lover, I\'m very particular about my masala chai. 9 Planet Impex has the most authentic blend I\'ve found. The spices are perfectly balanced.',
    product: 'Royal Masala Chai',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&q=80',
  },
  {
    id: 3,
    name: 'Ananya Reddy',
    location: 'Bangalore',
    rating: 5,
    text: 'The Kashmiri Kahwa is a game-changer. The saffron quality is exceptional and the blend of almonds and spices creates a luxurious experience.',
    product: 'Kashmiri Kahwa',
    image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&q=80',
  },
];

export function CustomerReviews() {
  return (
    <section className="py-20 bg-muted/30">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-accent font-medium tracking-widest uppercase text-sm">
            Testimonials
          </span>
          <h2 className="font-display text-3xl sm:text-4xl font-semibold text-foreground mt-2 mb-4">
            What Our Customers Say
          </h2>
          <p className="text-muted-foreground leading-relaxed">
            Join thousands of tea lovers who have made 9 Planet Impex their trusted 
            source for premium teas.
          </p>
        </div>

        {/* Reviews Grid */}
        <div className="grid md:grid-cols-3 gap-8">
          {reviews.map((review, index) => (
            <div
              key={review.id}
              className="bg-card rounded-2xl p-8 shadow-soft hover:shadow-elevated transition-all duration-300 animate-fade-up"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <Quote className="h-10 w-10 text-accent/30 mb-4" />
              
              {/* Rating */}
              <div className="flex gap-1 mb-4">
                {[...Array(review.rating)].map((_, i) => (
                  <Star key={i} className="h-5 w-5 fill-accent text-accent" />
                ))}
              </div>

              {/* Review Text */}
              <p className="text-foreground leading-relaxed mb-6">
                "{review.text}"
              </p>

              {/* Product Badge */}
              <div className="inline-block px-3 py-1 bg-muted rounded-full text-sm text-muted-foreground mb-6">
                Verified purchase: {review.product}
              </div>

              {/* Author */}
              <div className="flex items-center gap-4 pt-6 border-t border-border">
                <img
                  src={review.image}
                  alt={review.name}
                  className="w-12 h-12 rounded-full object-cover"
                />
                <div>
                  <p className="font-semibold text-foreground">{review.name}</p>
                  <p className="text-sm text-muted-foreground">{review.location}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Trust Indicators */}
        <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          <div className="animate-fade-up">
            <p className="font-display text-4xl font-bold text-primary">4.9</p>
            <div className="flex justify-center gap-1 my-2">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="h-4 w-4 fill-accent text-accent" />
              ))}
            </div>
            <p className="text-sm text-muted-foreground">Average Rating</p>
          </div>
          <div className="animate-fade-up" style={{ animationDelay: '0.1s' }}>
            <p className="font-display text-4xl font-bold text-primary">10,000+</p>
            <p className="text-sm text-muted-foreground mt-2">Happy Customers</p>
          </div>
          <div className="animate-fade-up" style={{ animationDelay: '0.2s' }}>
            <p className="font-display text-4xl font-bold text-primary">25+</p>
            <p className="text-sm text-muted-foreground mt-2">Years of Excellence</p>
          </div>
          <div className="animate-fade-up" style={{ animationDelay: '0.3s' }}>
            <p className="font-display text-4xl font-bold text-primary">50+</p>
            <p className="text-sm text-muted-foreground mt-2">Tea Varieties</p>
          </div>
        </div>
      </div>
    </section>
  );
}
