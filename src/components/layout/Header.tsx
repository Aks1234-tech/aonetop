import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, ShoppingBag, Search, User, LogOut, LogIn } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';

const navigation = [
  { name: 'Home', href: '/' },
  { name: 'Shop', href: '/shop' },
  { name: 'About', href: '/about' },
  { name: 'Bulk Orders', href: '/bulk-orders' },
  { name: 'Contact', href: '/contact' },
];

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { cartCount, toggleCart } = useCart();
  const { user, profile, isAdmin, signOut } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleSignOut = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('[Header] Sign out clicked');
    try {
      await signOut();
      console.log('[Header] Sign out completed successfully');
    } catch (error) {
      console.error('[Header] Sign out error:', error);
    } finally {
      // Always navigate to home, even if signOut had issues
      console.log('[Header] Navigating to home');
      navigate('/');
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-white shadow-sm border-b border-gray-200">
      <nav className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-20 items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center group-hover:scale-105 transition-transform duration-300">
              <span className="text-primary-foreground font-display text-xl font-bold">9</span>
            </div>
            <div className="hidden sm:block">
              <h1 className="font-display text-xl font-semibold text-gray-900 tracking-tight">
                9 Planet Impex
              </h1>
              <p className="text-x text-gray-500 tracking-widest uppercase">
                Premium Teas
              </p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex lg:gap-x-8">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={cn(
                  "text-xl font-medium transition-colors duration-200 relative py-2",
                  location.pathname === item.href
                    ? "text-primary font-semibold"
                    : "text-gray-700 hover:text-primary"
                )}
              >
                {item.name}
                {location.pathname === item.href && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full" />
                )}
              </Link>
            ))}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 sm:gap-4">
            <Button variant="ghost" size="icon" className="hidden sm:flex">
              <Search className="h-5 w-5" />
            </Button>

            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="hidden sm:flex">
                    <User className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <div className="px-2 py-1.5">
                    <p className="text-sm font-medium">{profile?.full_name || 'User'}</p>
                    <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link to="/profile" className="cursor-pointer">
                      <User className="h-4 w-4 mr-2" />
                      My Profile
                    </Link>
                  </DropdownMenuItem>
                  {isAdmin && (
                    <DropdownMenuItem asChild>
                      <Link to="/admin" className="cursor-pointer">
                        <User className="h-4 w-4 mr-2" />
                        Admin Dashboard
                      </Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onSelect={(e) => e.preventDefault()}
                    onClick={handleSignOut}
                    className="text-destructive cursor-pointer"
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link to="/login">
                <Button variant="ghost" size="icon" className="hidden sm:flex">
                  <LogIn className="h-5 w-5" />
                </Button>
              </Link>
            )}

            {!isAdmin && (
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleCart}
                className="relative"
              >
                <ShoppingBag className="h-5 w-5" />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-primary text-primary-foreground text-xs font-bold flex items-center justify-center animate-scale-in">
                    {cartCount}
                  </span>
                )}
              </Button>
            )}

            {/* Mobile menu button */}
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="lg:hidden py-4 border-t border-border/50 animate-fade-up">
            <div className="flex flex-col gap-2">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={cn(
                    "px-4 py-3 rounded-lg text-base font-medium transition-colors duration-200",
                    location.pathname === item.href
                      ? "bg-primary text-primary-foreground"
                      : "text-foreground hover:bg-muted"
                  )}
                >
                  {item.name}
                </Link>
              ))}
              {user && (
                <Link
                  to="/profile"
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-4 py-3 rounded-lg text-base font-medium text-foreground hover:bg-muted flex items-center gap-2"
                >
                  <User className="h-5 w-5" />
                  Profile
                </Link>
              )}
              {user ? (
                <button
                  onClick={(e) => {
                    handleSignOut(e);
                    setMobileMenuOpen(false);
                  }}
                  className="px-4 py-3 rounded-lg text-base font-medium text-destructive hover:bg-muted flex items-center gap-2 w-full text-left"
                >
                  <LogOut className="h-5 w-5" />
                  Sign Out
                </button>
              ) : (
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-4 py-3 rounded-lg text-base font-medium text-foreground hover:bg-muted flex items-center gap-2"
                >
                  <LogIn className="h-5 w-5" />
                  Sign In
                </Link>
              )}
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}
