import { useState } from 'react';
import { DollarSign, Sparkles, List, Clock, Send, CheckCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useSubmitBulkInquiry } from '@/hooks/useForms';

const benefits = [
  {
    icon: DollarSign,
    title: 'Competitive Pricing',
    description: 'Get the best rates on bulk orders with our special wholesale pricing structure.',
    color: 'bg-green-50',
    iconColor: 'text-green-600',
  },
  {
    icon: Sparkles,
    title: 'Best Quality',
    description: 'Premium organic products sourced directly from certified farms ensuring top quality.',
    color: 'bg-amber-50',
    iconColor: 'text-amber-600',
  },
  {
    icon: List,
    title: 'Different Varieties',
    description: 'Wide range of Tea, Honey, and Ghee products to meet all your business needs.',
    color: 'bg-purple-50',
    iconColor: 'text-purple-600',
  },
  {
    icon: Clock,
    title: 'Priority Processing',
    description: 'Bulk orders receive priority processing and expedited handling.',
    color: 'bg-orange-50',
    iconColor: 'text-orange-600',
  },
];

const BulkOrders = () => {
  const { toast } = useToast();
  const submitInquiry = useSubmitBulkInquiry();
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    companyName: '',
    contactName: '',
    email: '',
    phone: '',
    businessType: '',
    estimatedVolume: '',
    productsInterested: '',
    address: '',
    pincode: '',
    message: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.companyName || !formData.contactName || !formData.email || !formData.phone) {
      toast({
        title: 'Please fill in required fields',
        variant: 'destructive',
      });
      return;
    }

    try {
      await submitInquiry.mutateAsync({
        companyName: formData.companyName,
        contactName: formData.contactName,
        email: formData.email,
        phone: formData.phone,
        businessType: formData.businessType || undefined,
        estimatedVolume: formData.estimatedVolume || undefined,
        productsInterested: formData.productsInterested || undefined,
        address: formData.address || undefined,
        pincode: formData.pincode || undefined,
        message: formData.message || undefined,
      });

      setSubmitted(true);
      toast({
        title: 'Inquiry submitted!',
        description: 'Our team will contact you within 24 hours.',
      });
    } catch (error) {
      toast({
        title: 'Error submitting inquiry',
        description: 'Please try again later.',
        variant: 'destructive',
      });
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center py-20">
        <div className="text-center max-w-md">
          <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="h-10 w-10 text-primary" />
          </div>
          <h1 className="font-display text-3xl font-semibold text-foreground mb-4">
            Thank You for Your Interest!
          </h1>
          <p className="text-muted-foreground mb-8">
            We've received your bulk order inquiry. Our B2B team will review your
            requirements and get back to you within 24 hours with a customized quote.
          </p>
          <Button variant="gold" onClick={() => setSubmitted(false)}>
            Submit Another Inquiry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <section className="relative h-[300px] overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1766040923580-16ad32fae8b4?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3YXJlaG91c2UlMjBpbnZlbnRvcnklMjBib3hlc3xlbnwxfHx8fDE3Njk4NzYwNzh8MA&ixlib=rb-4.1.0&q=80&w=1080"
            alt="Bulk shipping boxes"
            className="w-full h-full object-cover"
          />
          {/* Dark Overlay */}
          <div className="absolute inset-0 bg-black/60" />
        </div>

        {/* Content */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center px-4">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-4">
              Bulk Orders
            </h1>
            <p className="text-2xl text-white/90 max-w-2xl mx-auto">
              Perfect for restaurants, hotels, retailers, and corporate gifting
            </p>
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-16 sm:py-18 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Why Choose Our Bulk Service?
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              We make bulk ordering simple, affordable, and hassle-free
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {benefits.map((benefit) => (
              <div key={benefit.title} className="text-center">
                <div className={`w-20 h-20 rounded-full ${benefit.color} flex items-center justify-center mx-auto mb-4`}>
                  <benefit.icon className={`h-10 w-10 ${benefit.iconColor}`} />
                </div>
                <h3 className="font-bold text-lg text-gray-900 mb-2">
                  {benefit.title}
                </h3>
                <p className="text-gray-600 text-3sm leading-relaxed">
                  {benefit.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Form */}
      <section className="py-16 sm:py-18 bg-gray-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="font-display text-4xl font-semibold text-foreground mb-4">
                Request a Quote
              </h2>
              <p className="text-muted-foreground text-lg">
                Fill out the form below and our B2B team will get back to you
                with a customized quote within 24 hours.
              </p>
            </div>

            <div className="bg-card rounded-2xl p-8 shadow-soft">
              <form onSubmit={handleSubmit} className="space-y-6 text-sm">
                <div className="grid sm:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="companyName">Company Name *</Label>
                    <Input
                      id="companyName"
                      name="companyName"
                      value={formData.companyName}
                      onChange={handleChange}
                      placeholder="Your company name"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="contactName">Contact Name *</Label>
                    <Input
                      id="contactName"
                      name="contactName"
                      value={formData.contactName}
                      onChange={handleChange}
                      placeholder="Your name"
                      required
                    />
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="business@example.com"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone">Phone *</Label>
                    <Input
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="+91 98765 43210"
                      required
                    />
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="businessType">Business Type</Label>
                    <select
                      id="businessType"
                      name="businessType"
                      value={formData.businessType}
                      onChange={handleChange}
                      className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                    >
                      <option value="">Select your business type</option>
                      <option value="hotel">Hotel</option>
                      <option value="restaurant">Restaurant</option>
                      <option value="cafe">Cafe</option>
                      <option value="retailer">Retailer</option>
                      <option value="distributor">Distributor</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  <div>
                    <Label htmlFor="estimatedVolume">Estimated Monthly Volume</Label>
                    <select
                      id="estimatedVolume"
                      name="estimatedVolume"
                      value={formData.estimatedVolume}
                      onChange={handleChange}
                      className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                    >
                      <option value="">Select volume</option>
                      <option value="5-10kg">5-10 kg</option>
                      <option value="10-25kg">10-25 kg</option>
                      <option value="25-50kg">25-50 kg</option>
                      <option value="50-100kg">50-100 kg</option>
                      <option value="100kg+">100+ kg</option>
                    </select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="productsInterested">Products Interested In</Label>
                  <Input
                    id="productsInterested"
                    name="productsInterested"
                    value={formData.productsInterested}
                    onChange={handleChange}
                    placeholder="e.g., Darjeeling, Assam, Chai Blends"
                  />
                </div>

                <div>
                  <Label htmlFor="address">Delivery Address</Label>
                  <Textarea
                    id="address"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    placeholder="Enter complete delivery address"
                    rows={3}
                  />
                </div>

                <div className="grid sm:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="pincode">Pincode</Label>
                    <Input
                      id="pincode"
                      name="pincode"
                      value={formData.pincode}
                      onChange={handleChange}
                      placeholder="Enter 6-digit pincode"
                      maxLength={6}
                      pattern="[0-9]{6}"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="message">Additional Requirements</Label>
                  <Textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    placeholder="Tell us about your specific requirements, packaging preferences, etc."
                    rows={4}
                  />
                </div>

                <Button
                  type="submit"
                  variant="gold"
                  size="lg"
                  className="w-full"
                  disabled={submitInquiry.isPending}
                >
                  {submitInquiry.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Send className="mr-2 h-5 w-5" />
                      Submit Inquiry
                    </>
                  )}
                </Button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-muted/60 rounded-2xl p-8 md:p-12 text-center">
            <h2 className="font-display text-4xl font-semibold text-foreground mb-4">
              Prefer to Talk Directly?
            </h2>
            <p className="text-muted-foreground mb-6 max-w-3xl mx-auto">
              Our B2B team is available Monday to Saturday, 9 AM to 6 PM IST.
              Call us for immediate assistance with your bulk order requirements.
            </p>
            <div className="flex flex-col md:flex-row gap-4 justify-center">
              <Button variant="default" size="lg" asChild>
                <a href="tel:+919876543210">Call : +91 7503517503</a>
              </Button>
              <Button variant="outline" size="lg" asChild>
                <a href="mailto:b2b@9planetimpex.com">Email Us : 9planetimpex@gmail.com</a>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default BulkOrders;
