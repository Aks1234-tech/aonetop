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

      <section className="py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-3 gap-12">
            {/* Contact Info */}
            <div className="lg:col-span-1 space-y-8">
              <div>
                <h2 className="font-display text-2xl font-semibold text-foreground mb-6">
                  Contact Information
                </h2>
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
