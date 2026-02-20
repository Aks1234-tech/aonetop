import { useState } from 'react';
import { Send, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';

export function Newsletter() {
  const [email, setEmail] = useState('');
  const [isSubscribed, setIsSubscribed] = useState(false);
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      toast({
        title: 'Please enter your email',
        variant: 'destructive',
      });
      return;
    }

    // Simulate subscription
    setIsSubscribed(true);
    toast({
      title: 'Welcome to the family!',
      description: 'Thank you for subscribing. Check your inbox for a special welcome offer.',
    });
    setEmail('');

    setTimeout(() => setIsSubscribed(false), 3000);
  };

  return (
    <section className="py-20 bg-background relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-0 left-1/4 w-96 h-96 rounded-full bg-primary blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 rounded-full bg-accent blur-3xl" />
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="max-w-3xl mx-auto text-center">
          <span className="text-accent font-medium tracking-widest uppercase text-sm">
            Stay Connected
          </span>
          <h2 className="font-display text-3xl sm:text-4xl font-semibold text-foreground mt-2 mb-4">
            Join Our Tea Community
          </h2>
          <p className="text-muted-foreground leading-relaxed mb-8 max-w-xl mx-auto">
            Subscribe for exclusive offers, brewing tips, and first access to 
            new arrivals. Get 10% off your first order!
          </p>

          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
            <Input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="flex-1 h-12 bg-card border-border"
              disabled={isSubscribed}
            />
            <Button
              type="submit"
              variant="gold"
              size="lg"
              disabled={isSubscribed}
              className="h-12"
            >
              {isSubscribed ? (
                <>
                  <CheckCircle className="mr-2 h-5 w-5" />
                  Subscribed!
                </>
              ) : (
                <>
                  <Send className="mr-2 h-5 w-5" />
                  Subscribe
                </>
              )}
            </Button>
          </form>

          <p className="text-xs text-muted-foreground mt-4">
            By subscribing, you agree to receive marketing communications from us. 
            Unsubscribe anytime.
          </p>
        </div>
      </div>
    </section>
  );
}
