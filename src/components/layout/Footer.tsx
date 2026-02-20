import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin, Instagram, Facebook, Twitter } from 'lucide-react';
import { useSiteContent } from '@/hooks/useSiteContent';


const footerLinks = {
  shop: [
    { name: 'All Teas', href: '/shop' },
    { name: 'Honey', href: '/shop?category=honey' },
    { name: 'Ghee', href: '/shop?category=ghee' },
  ],
  company: [
    { name: 'Our Story', href: '/about' },
    { name: 'Bulk Orders', href: '/bulk-orders' },
    { name: 'Contact Us', href: '/contact' },
    { name: 'Blog', href: '/blog' },
  ],
  support: [
    { name: 'Shipping Info', href: '/shipping' },
    { name: 'Returns', href: '/returns' },
    { name: 'FAQ', href: '/faq' },
    { name: 'Track Order', href: '/track-order' },
  ],
};

export function Footer() {
  const { data: content } = useSiteContent();
  return (
    <footer className="bg-gray-900 text-white">
      {/* Main Footer */}
      <div className="container mx-auto pl-[10%] pr-4 sm:px-6 lg:px-8 py-7">
        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-12">
          {/* Brand Section */}
          <div className="col-span-2 lg:col-span-2">
            <Link to="/" className="flex items-center gap-3 mb-6" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
              {content?.logo?.url ? (
                <img src={content.logo.url} alt={content?.logo?.alt || "9 Planet Impex"} className="h-16 sm:h-18 w-auto object-contain" />
              ) : (
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-primary flex items-center justify-center group-hover:scale-105 transition-transform duration-300">
                  <span className="text-primary-foreground font-display text-lg sm:text-xl font-bold">9</span>
                </div>
              )}
              <div>
                <h2 className="font-display text-xl font-semibold tracking-tight">
                  9 Planet Impex
                </h2>
              </div>
            </Link>
            <p className="text-gray-400 leading-relaxed mb-6 max-w-md">
              Sourcing the finest teas from India's legendary gardens.
              Each cup tells a story of tradition, craftsmanship, and
              the pure essence of nature.
            </p>
            <div className="flex gap-4">
              <a
                href="https://indiamart.in/X93gbPll"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-white-800 flex items-center justify-center hover:bg-white hover:text-white transition-colors duration-300"
              >
                <img
                  src="https://zhwwybsuomutemjojcht.supabase.co/storage/v1/object/public/content-images/INDIAMART.NS.png"
                  alt="IndiaMart"
                  className="w-8 h-8 object-contain"
                />
              </a>
              <a
                href="https://www.instagram.com/9planetimpex?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw=="
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-white-800 flex items-center justify-center hover:bg-white hover:text-white transition-colors duration-300"
              >
                <img
                  src="https://zhwwybsuomutemjojcht.supabase.co/storage/v1/object/public/content-images/v982-d3-04-removebg-preview.png"
                  alt="Instagram"
                  className="w-8 h-8 object-contain"
                />
              </a>
              <a
                href="https://www.facebook.com/share/1CXdLtosMJ/"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-white-800 flex items-center justify-center hover:bg-white hover:text-white transition-colors duration-300"
              >
                <img
                  src="https://zhwwybsuomutemjojcht.supabase.co/storage/v1/object/public/content-images/fb.png"
                  alt="Facebook"
                  className="w-8 h-8 object-contain"
                />
              </a>
            </div>
          </div>

          {/* Shop Links */}
          <div>
            <h3 className="font-display text-lg font-semibold mb-4">Shop</h3>
            <ul className="space-y-3">
              {footerLinks.shop.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.href}
                    onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                    className="text-gray-400 hover:text-white transition-colors duration-200"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company Links */}
          <div>
            <h3 className="font-display text-lg font-semibold mb-4">Company</h3>
            <ul className="space-y-3">
              {footerLinks.company.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.href}
                    onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                    className="text-gray-400 hover:text-white transition-colors duration-200"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div className="col-span-2 md:col-span-1 lg:col-span-1">
            <h3 className="font-display text-lg font-semibold mb-4">Contact</h3>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                <span className="text-gray-400 text-sm">
                  Maratha Building,<br />
                  Mandi Prangan,<br />
                  Pratap Chowk, Chotisadri, Pratapgarh, Rajasthan,<br />
                  India - 312604
                </span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="h-5 w-5 text-primary shrink-0" />
                <a
                  href="tel:+917503517503"
                  className="text-gray-400 hover:text-white transition-colors duration-200 text-sm"
                >
                  +91 75035 17503
                </a>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-primary shrink-0" />
                <a
                  href="mailto:9planetimpax@gmail.com"
                  className="text-gray-400 hover:text-white transition-colors duration-200 text-sm"
                >
                  9planetimpax@gmail.com
                </a>
              </li>
            </ul>

          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-gray-800">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-gray-400 text-sm">
              © {new Date().getFullYear()} 9 Planet Impex. All rights reserved.
            </p>
            <div className="flex gap-6 text-sm">
              <Link
                to="/privacy"
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                className="text-gray-400 hover:text-white transition-colors duration-200"
              >
                Privacy Policy
              </Link>
              <Link
                to="/terms"
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                className="text-gray-400 hover:text-white transition-colors duration-200"
              >
                Terms of Service
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
