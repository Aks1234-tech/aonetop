import { Leaf, Award, Truck, Heart, Shield, Globe } from 'lucide-react';

const features = [
  {
    icon: Leaf,
    title: '100% Organic',
    description: 'All our teas are certified organic, grown without pesticides or artificial chemicals.',
  },
  {
    icon: Award,
    title: 'Premium Quality',
    description: 'We source only the finest first and second flush teas from renowned gardens.',
  },
  {
    icon: Globe,
    title: 'Direct Sourcing',
    description: 'We work directly with tea estates, ensuring fair prices for farmers.',
  },
  {
    icon: Truck,
    title: 'Fresh Delivery',
    description: 'Our teas are packaged fresh and shipped to preserve maximum flavor.',
  },
  {
    icon: Heart,
    title: 'Handcrafted',
    description: 'Each blend is carefully crafted by our master tea sommeliers.',
  },
  {
    icon: Shield,
    title: 'Quality Assured',
    description: 'Every batch is tested for purity, taste, and aroma consistency.',
  },
];

export function WhyChoose() {
  return (
    <section className="py-12 bg-background text-foreground">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-primary font-medium tracking-widest uppercase text-sm">
            The 9 Planet Promise
          </span>
          <h2 className="font-display text-3xl sm:text-4xl font-semibold mt-2 mb-4">
            Why Choose Us
          </h2>
          <p className="text-muted-foreground leading-relaxed">
            We're committed to bringing you the finest teas while supporting sustainable
            practices and the communities that grow them.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div
              key={feature.title}
              className="group p-8 rounded-2xl bg-card border border-border hover:bg-muted transition-all duration-300 animate-fade-up"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <feature.icon className="h-7 w-7 text-primary" />
              </div>
              <h3 className="font-display text-xl font-semibold mb-3">
                {feature.title}
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
