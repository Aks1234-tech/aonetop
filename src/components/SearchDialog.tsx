import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, X, Loader2 } from 'lucide-react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useProducts, type Product } from '@/hooks/useProducts';

interface SearchDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function SearchDialog({ open, onOpenChange }: SearchDialogProps) {
    const [searchQuery, setSearchQuery] = useState('');
    const [debouncedQuery, setDebouncedQuery] = useState('');
    const navigate = useNavigate();

    // Debounce search query
    useEffect(() => {
        const timeout = setTimeout(() => {
            setDebouncedQuery(searchQuery);
        }, 300);
        return () => clearTimeout(timeout);
    }, [searchQuery]);

    // Fetch products based on search
    const { data: products = [], isLoading } = useProducts({
        filters: {
            search: debouncedQuery || undefined,
        },
        enabled: debouncedQuery.length > 0,
    });

    // Limit results to 8
    const limitedResults = products.slice(0, 8);

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            minimumFractionDigits: 0,
        }).format(price / 100);
    };

    const getProductImage = (product: Product) => {
        const primaryImage = product.images?.find(img => img.is_primary);
        return primaryImage?.url || product.images?.[0]?.url || 'https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=800&q=80';
    };

    const handleProductClick = (slug: string) => {
        onOpenChange(false);
        setSearchQuery('');
        navigate(`/products/${slug}`);
    };

    const handleViewAll = () => {
        onOpenChange(false);
        navigate(`/shop?search=${encodeURIComponent(searchQuery)}`);
        setSearchQuery('');
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden p-0">
                <DialogHeader className="px-6 pt-6 pb-4 border-b">
                    <DialogTitle className="text-2xl font-bold">Search Products</DialogTitle>
                </DialogHeader>

                {/* Search Input */}
                <div className="px-6 py-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                        <Input
                            placeholder="Search for tea, honey, ghee..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10 pr-10 h-12 text-lg"
                            autoFocus
                        />
                        {searchQuery && (
                            <button
                                onClick={() => setSearchQuery('')}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        )}
                    </div>
                </div>

                {/* Results */}
                <div className="px-6 pb-6 overflow-y-auto max-h-[calc(80vh-180px)]">
                    {!searchQuery ? (
                        <div className="text-center py-12 text-muted-foreground">
                            <Search className="h-12 w-12 mx-auto mb-4 opacity-50" />
                            <p>Start typing to search products...</p>
                        </div>
                    ) : isLoading ? (
                        <div className="flex items-center justify-center py-12">
                            <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        </div>
                    ) : limitedResults.length === 0 ? (
                        <div className="text-center py-12 text-muted-foreground">
                            <p className="mb-2">No products found for "{searchQuery}"</p>
                            <p className="text-sm">Try different keywords</p>
                        </div>
                    ) : (
                        <>
                            <div className="space-y-2">
                                {limitedResults.map((product) => (
                                    <button
                                        key={product.id}
                                        onClick={() => handleProductClick(product.slug)}
                                        className="w-full flex items-center gap-4 p-3 rounded-lg hover:bg-muted transition-colors text-left"
                                    >
                                        <img
                                            src={getProductImage(product)}
                                            alt={product.name}
                                            className="w-16 h-16 object-cover rounded-lg"
                                        />
                                        <div className="flex-1 min-w-0">
                                            <h4 className="font-medium text-foreground line-clamp-1">
                                                {product.name}
                                            </h4>
                                            <p className="text-sm text-muted-foreground line-clamp-1">
                                                {product.description}
                                            </p>
                                            <p className="text-sm font-semibold text-primary mt-1">
                                                {formatPrice(product.price)}
                                            </p>
                                        </div>
                                    </button>
                                ))}
                            </div>

                            {/* View All Button */}
                            {products.length > 8 && (
                                <div className="mt-4 pt-4 border-t">
                                    <Button
                                        variant="outline"
                                        className="w-full"
                                        onClick={handleViewAll}
                                    >
                                        View all {products.length} results
                                    </Button>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
