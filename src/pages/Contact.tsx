import { useState } from 'react';
import { Mail, Phone, MapPin, Clock, Send, MessageSquare, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useSubmitContactForm } from '@/hooks/useForms';

const Contact = () => {
  const { toast } = useToast();
  const submitForm = useSubmitContactForm();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.email || !formData.message) {
      toast({
        title: 'Please fill in required fields',
        variant: 'destructive',
      });
      return;
    }

    try {
      await submitForm.mutateAsync({
        name: formData.name,
        email: formData.email,
        phone: formData.phone || undefined,
        subject: formData.subject || undefined,
        message: formData.message,
      });

      toast({
        title: 'Message sent!',
        description: 'We\'ll get back to you within 24 hours.',
      });

      setFormData({ name: '', email: '', phone: '', subject: '', message: '' });
    } catch (error) {
      toast({
        title: 'Error sending message',
        description: 'Please try again later.',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <section className="relative h-[300px] overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1423666639041-f56000c27a9a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1920"
            alt="Customer support"
            className="w-full h-full object-cover"
            style={{ filter: 'blur(2px)' }}
          />
          {/* Dark Overlay */}
          <div className="absolute inset-0 bg-black/50" />
        </div>

        {/* Content */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center px-4">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-4">
              Get in Touch
            </h1>
            <p className="text-2xl text-white/90 max-w-4xl mx-auto">
              We'd love to hear from you. Our team is here to help with any questions.
            </p>
          </div>
        </div>
      </section>

      {/* Contact Info Cards */}
      <section className="py-16 sm:py-18 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Phone Card */}
            <div className="bg-white rounded-xl border border-gray-200 p-8 text-center hover:shadow-lg transition-shadow">
              <div className="w-16 h-16 rounded-full bg-blue-50 flex items-center justify-center mx-auto mb-4">
                <Phone className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="font-bold text-lg text-gray-900 mb-3">Phone</h3>
              <div className="text-gray-600 text-sm space-y-1">
                <p>+91-7503517503</p>
                <p>+1 (555) 987-6543</p>
              </div>
            </div>

            {/* Email Card */}
            <div className="bg-white rounded-xl border border-gray-200 p-8 text-center hover:shadow-lg transition-shadow">
              <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-4">
                <Mail className="h-8 w-8 text-red-600" />
              </div>
              <h3 className="font-bold text-lg text-gray-900 mb-3">Email</h3>
              <div className="text-gray-600 text-sm space-y-1">
                <p>9planetimpex@gmail.com</p>
                <p>support@9planetimpex.com</p>
              </div>
            </div>

            {/* Address Card */}
            <div className="bg-white rounded-xl border border-gray-200 p-8 text-center hover:shadow-lg transition-shadow">
              <div className="w-16 h-16 rounded-full bg-green-50 flex items-center justify-center mx-auto mb-4">
                <MapPin className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="font-bold text-lg text-gray-900 mb-3">Address</h3>
              <div className="text-gray-600 text-sm space-y-1">
                <p>123 Organic Lane</p>
                <p>Nature City, NC 12345</p>
              </div>
            </div>

            {/* Business Hours Card */}
            <div className="bg-white rounded-xl border border-gray-200 p-8 text-center hover:shadow-lg transition-shadow">
              <div className="w-16 h-16 rounded-full bg-purple-50 flex items-center justify-center mx-auto mb-4">
                <Clock className="h-8 w-8 text-purple-600" />
              </div>
              <h3 className="font-bold text-lg text-gray-900 mb-3">Business Hours</h3>
              <div className="text-gray-600 text-sm space-y-1">
                <p>Mon-Fri: 9:00 AM - 6:00 PM</p>
                <p>Sat: 10:00 AM - 4:00 PM</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Form */}
      <section className="py-16 sm:py-18 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Left: Contact Form */}
            <div className="bg-card rounded-2xl p-8 shadow-soft">
              <h2 className="font-display text-3xl font-semibold text-foreground mb-2">
                Send Us a Message
              </h2>
              <p className="text-muted-foreground text-base mb-6">
                Fill out the form below and we'll get back to you as soon as possible
              </p>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <Label htmlFor="name">Full Name *</Label>
                  <Input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="name"
                    required
                  />
                </div>

                <div className="grid sm:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="email">Email Address *</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="abc@example.com"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="+91 7503517503"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="subject">Subject *</Label>
                  <Input
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    placeholder="Select a subject"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="message">Message *</Label>
                  <Textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    placeholder="Tell us how we can help you..."
                    rows={6}
                    required
                  />
                </div>

                <Button
                  type="submit"
                  variant="default"
                  size="lg"
                  className="w-full bg-red-600 hover:bg-red-700"
                  disabled={submitForm.isPending}
                >
                  {submitForm.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="mr-2 h-5 w-5" />
                      Send Message
                    </>
                  )}
                </Button>
              </form>
            </div>

            {/* Right: Map and Quick Support */}
            <div className="space-y-8">
              {/* Map Placeholder */}
              <div className="bg-gray-200 rounded-2xl h-64 flex items-center justify-center">
                <div className="text-center">
                  <MapPin className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-700 font-semibold">SH-15</p>
                  <p className="text-gray-600">Pratap Chowk, Chhoti Sadri(Raj.) -312604</p>
                </div>
              </div>

              {/* Quick Support */}
              <div className="bg-white rounded-2xl p-8 shadow-soft">
                <h3 className="font-display text-2xl font-semibold text-foreground mb-6">
                  Quick Support
                </h3>
                <div className="space-y-6">
                  {/* Live Chat */}
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-lg bg-red-600 flex items-center justify-center shrink-0">
                      <MessageSquare className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h4 className="font-bold text-foreground mb-1">Live Chat</h4>
                      <p className="text-sm text-muted-foreground">
                        Chat with our support team for instant help during business hours
                      </p>
                    </div>
                  </div>

                  {/* Email Response */}
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-lg bg-red-600 flex items-center justify-center shrink-0">
                      <Mail className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h4 className="font-bold text-foreground mb-1">Email Response</h4>
                      <p className="text-sm text-muted-foreground">
                        We typically respond to emails within 24 hours on business days
                      </p>
                    </div>
                  </div>

                  {/* Phone Support */}
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-lg bg-red-600 flex items-center justify-center shrink-0">
                      <Phone className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h4 className="font-bold text-foreground mb-1">Phone Support</h4>
                      <p className="text-sm text-muted-foreground">
                        Call us Monday through Saturday, 9am-6pm IST for immediate assistance
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>


    </div>
  );
};

export default Contact;
