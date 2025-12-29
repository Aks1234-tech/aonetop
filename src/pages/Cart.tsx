import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Minus, Trash2, ShoppingBag, ArrowRight, Tag, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useCart } from '@/contexts/CartContext';

const Cart = () => {
  const {
    items,
    updateQuantity,
    removeFromCart,
    cartTotal,
    cartCount,
    clearCart,
    applyOffer,
    removeOffer,
    appliedOffer,
    discount,
    finalTotal
  } = useCart();

  const [promoCode, setPromoCode] = useState('');

  const handleApplyOffer = async () => {
    if (!promoCode.trim()) return;
    const success = await applyOffer(promoCode);
    if (success) {
      setPromoCode('');
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const shippingCost = cartTotal >= 999 ? 0 : 99;
  // orderTotal logic moved to render using finalTotal + shippingCost

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center py-20">
        <div className="text-center">
          <ShoppingBag className="h-24 w-24 text-muted-foreground/30 mx-auto mb-6" />
          <h1 className="font-display text-3xl font-semibold text-foreground mb-4">
            Your cart is empty
          </h1>
          <p className="text-muted-foreground mb-8 max-w-md mx-auto">
            Looks like you haven't added any teas to your cart yet.
            Explore our collection and find your perfect cup!
          </p>
          <Button variant="gold" size="lg" asChild>
            <Link to="/shop">
              Start Shopping
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-12">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="font-display text-3xl sm:text-4xl font-semibold text-foreground mb-8">
          Shopping Cart ({cartCount} items)
        </h1>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {items.map((item) => (
              <div
                key={item.id}
                className="flex gap-6 p-6 bg-card rounded-2xl shadow-soft"
              >
                <Link to={`/products/${item.id}`} className="shrink-0">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-24 h-24 sm:w-32 sm:h-32 object-cover rounded-xl"
                  />
                </Link>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start">
                    <div>
                      <Link to={`/products/${item.id}`}>
                        <h3 className="font-display text-lg font-medium text-foreground hover:text-primary transition-colors">
                          {item.name}
                        </h3>
                      </Link>
                      {item.weight && (
                        <p className="text-sm text-muted-foreground">{item.weight}</p>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-muted-foreground hover:text-destructive"
                      onClick={() => removeFromCart(item.id)}
                    >
                      <Trash2 className="h-5 w-5" />
                    </Button>
                  </div>

                  <div className="flex items-center justify-between mt-4">
                    <div className="flex items-center border border-border rounded-lg">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-9 w-9"
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                      <span className="w-10 text-center font-medium">{item.quantity}</span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-9 w-9"
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                    <p className="font-display text-xl font-semibold text-primary">
                      {formatPrice(item.price * item.quantity)}
                    </p>
                  </div>
                </div>
              </div>
            ))}

            {/* Clear Cart */}
            <Button
              variant="ghost"
              className="text-muted-foreground hover:text-destructive"
              onClick={clearCart}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Clear Cart
            </Button>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-card rounded-2xl p-6 shadow-soft sticky top-24">
              <h2 className="font-display text-xl font-semibold text-foreground mb-6">
                Order Summary
              </h2>

              <div className="space-y-4 mb-6">
                <div className="flex justify-between text-muted-foreground">
                  <span>Subtotal</span>
                  <span>{formatPrice(cartTotal)}</span>
                </div>

                {/* Promo Code Input */}
                {!appliedOffer ? (
                  <div className="flex gap-2">
                    <Input
                      placeholder="Enter promo code"
                      value={promoCode}
                      onChange={(e) => setPromoCode(e.target.value)}
                      className="bg-background"
                    />
                    <Button
                      variant="outline"
                      onClick={handleApplyOffer}
                      disabled={!promoCode.trim()}
                    >
                      Apply
                    </Button>
                  </div>
                ) : (
                  <div className="flex justify-between items-center text-green-600 bg-green-50 p-2 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Tag className="h-4 w-4" />
                      <span className="text-sm font-medium">{appliedOffer.code} applied</span>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 hover:text-destructive hover:bg-transparent"
                      onClick={removeOffer}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                )}

                {discount > 0 && (
                  <div className="flex justify-between text-green-600 font-medium">
                    <span>Discount</span>
                    <span>-{formatPrice(discount)}</span>
                  </div>
                )}

                <div className="flex justify-between text-muted-foreground">
                  <span>Shipping</span>
                  <span>
                    {shippingCost === 0 ? (
                      <span className="text-primary font-medium">Free</span>
                    ) : (
                      formatPrice(shippingCost)
                    )}
                  </span>
                </div>
                {cartTotal < 999 && (
                  <p className="text-sm text-muted-foreground">
                    Add {formatPrice(999 - cartTotal)} more for free shipping
                  </p>
                )}
                <div className="border-t border-border pt-4">
                  <div className="flex justify-between">
                    <span className="font-display text-lg font-semibold text-foreground">
                      Total
                    </span>
                    <span className="font-display text-2xl font-bold text-primary">
                      {formatPrice(finalTotal + shippingCost)}
                    </span>
                  </div>
                </div>
              </div>

              <Button variant="gold" size="lg" className="w-full" asChild>
                <Link to="/checkout">
                  Proceed to Checkout
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>

              <p className="text-sm text-muted-foreground text-center mt-4">
                Taxes calculated at checkout
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
