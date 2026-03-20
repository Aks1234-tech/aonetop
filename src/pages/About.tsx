import { Leaf, Mountain, Users, Award, Heart, Globe } from 'lucide-react';

const About = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <section className="relative py-20 bg-gradient-hero text-primary-foreground overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 right-20 w-96 h-96 rounded-full bg-gold/30 blur-3xl" />
        </div>

        <div className="flex items-center justify-center">
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
            <div>
              <h2 className="text-3xl sm:text-4xl font-semibold mb-6">
                Our Story
              </h2>
              <div className="space-y-4 text-muted-foreground leading-relaxed">
                <p>
                  9 Planet Impex was founded with a mission to make premium organic
                  products accessible to everyone.
                </p>
                <p>
                  Since 2015, we have worked directly with certified farms across India,
                  ensuring quality and authenticity.
                </p>
                <p>
                  From Darjeeling tea estates to Himalayan honey farms, we bring nature’s
                  best to your home.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <img
                src="https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=400&q=80"
                alt="Tea garden"
                className="rounded-2xl shadow-lg"
              />
              <img
                src="https://images.unsplash.com/photo-1571934811356-5cc061b6821f?w=400&q=80"
                alt="Tea processing"
                className="rounded-2xl shadow-lg mt-8"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-16 bg-muted/50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-semibold mb-4">
              Our Core Values
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Principles that guide everything we do.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: <Leaf />,
                title: "Quality First",
                text: "We ensure the highest quality in every product.",
              },
              {
                icon: <Globe />,
                title: "Sustainability",
                text: "Committed to eco-friendly and sustainable farming.",
              },
              {
                icon: <Users />,
                title: "Fair Trade",
                text: "Supporting farmers with fair pricing.",
              },
              {
                icon: <Mountain />,
                title: "Direct Sourcing",
                text: "Fresh products directly from farms.",
              },
              {
                icon: <Award />,
                title: "Authenticity",
                text: "100% genuine and traceable products.",
              },
              {
                icon: <Heart />,
                title: "Customer Love",
                text: "We value our customers like family.",
              },
            ].map((item, index) => (
              <div key={index} className="bg-card p-8 rounded-2xl shadow">
                <div className="mb-4 text-primary">{item.icon}</div>
                <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
                <p className="text-muted-foreground">{item.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Our Team
            </h2>
            <p className="text-muted-foreground">
              The passionate experts behind our success
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {[
              {
                name: "Rajesh Sharma",
                role: "Founder & CEO",
                img: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&q=80",
              },
              {
                name: "Priya Sharma",
                role: "Head of Curation",
                img: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&q=80",
              },
              {
                name: "Amit Patel",
                role: "Tea Expert",
                img: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&q=80",
              },
            ].map((member, index) => (
              <div key={index} className="text-center">
                <div className="w-32 h-32 mx-auto mb-4 rounded-full overflow-hidden">
                  <img
                    src={member.img}
                    alt={member.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <h3 className="font-semibold">{member.name}</h3>
                <p className="text-muted-foreground">{member.role}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;
