import { useState, useRef } from 'react';
import { Plus, Edit, Trash2, Loader2, Package, Upload, X, Image as ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import {
    useAdminProducts,
    useCreateProduct,
    useUpdateProduct,
    useDeleteProduct,
    useUploadProductImage,
    useDeleteProductImage,
    useCategories,
    Product,
} from '@/hooks/useProducts';
import { Tables } from '@/lib/supabase';

// Helper for currency
const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        minimumFractionDigits: 0,
    }).format(price);
};

// Helper to generate slug from name
function generateSlug(name: string): string {
    return name
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim();
}

interface ProductFormData {
    name: string;
    description: string;
    long_description: string;
    price: string;
    original_price: string;
    category: string;
    weight: string;
    origin: string;
    brewing_temp: string;
    brewing_time: string;
    brewing_amount: string;
    in_stock: boolean;
    is_featured: boolean;
    is_bestseller: boolean;
    is_new: boolean;
    image_url: string;
}

const initialFormData: ProductFormData = {
    name: '',
    description: '',
    long_description: '',
    price: '',
    original_price: '',
    category: 'Black Tea',
    weight: '100g',
    origin: '',
    brewing_temp: '',
    brewing_time: '',
    brewing_amount: '',
    in_stock: true,
    is_featured: false,
    is_bestseller: false,
    is_new: false,
    image_url: '',
};

export function ProductsManager() {
    const { data: products, isLoading } = useAdminProducts();
    const { data: categories } = useCategories();
    const createProduct = useCreateProduct();
    const updateProduct = useUpdateProduct();
    const deleteProduct = useDeleteProduct();
    const uploadImage = useUploadProductImage();
    const deleteImage = useDeleteProductImage();
    const { toast } = useToast();

    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);
    const [formData, setFormData] = useState<ProductFormData>(initialFormData);
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const resetForm = () => {
        setFormData(initialFormData);
        setEditingProduct(null);
    };

    const handleOpenDialog = (product?: Product) => {
        if (product) {
            setEditingProduct(product);
            setFormData({
                name: product.name,
                description: product.description || '',
                long_description: product.long_description || '',
                price: product.price.toString(),
                original_price: product.original_price?.toString() || '',
                category: product.category,
                weight: product.weight || '100g',
                origin: product.origin || '',
                brewing_temp: product.brewing_temp || '',
                brewing_time: product.brewing_time || '',
                brewing_amount: product.brewing_amount || '',
                in_stock: product.in_stock,
                is_featured: product.is_featured,
                is_bestseller: product.is_bestseller,
                is_new: product.is_new,
                image_url: product.images?.[0]?.url || '',
            });
        } else {
            resetForm();
        }
        setIsDialogOpen(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Basic validation
        if (!formData.name || !formData.price || !formData.category) {
            toast({ title: 'Please fill required fields (Name, Price, Category)', variant: 'destructive' });
            return;
        }

        const productData = {
            name: formData.name,
            slug: generateSlug(formData.name),
            description: formData.description || null,
            long_description: formData.long_description || null,
            price: parseInt(formData.price),
            original_price: formData.original_price ? parseInt(formData.original_price) : null,
            category: formData.category,
            weight: formData.weight || null,
            origin: formData.origin || null,
            brewing_temp: formData.brewing_temp || null,
            brewing_time: formData.brewing_time || null,
            brewing_amount: formData.brewing_amount || null,
            in_stock: formData.in_stock,
            is_featured: formData.is_featured,
            is_bestseller: formData.is_bestseller,
            is_new: formData.is_new,
        };

        try {
            if (editingProduct) {
                await updateProduct.mutateAsync({ id: editingProduct.id, updates: productData });
                toast({ title: 'Product updated successfully' });
            } else {
                await createProduct.mutateAsync(productData);
                toast({ title: 'Product created successfully' });
            }
            setIsDialogOpen(false);
            resetForm();
        } catch (error) {
            console.error(error);
            toast({ title: 'Failed to save product', variant: 'destructive' });
        }
    };

    const handleDelete = async (id: string, name: string) => {
        if (confirm(`Are you sure you want to delete "${name}"?`)) {
            try {
                await deleteProduct.mutateAsync(id);
                toast({ title: 'Product deleted successfully' });
            } catch (error) {
                toast({ title: 'Failed to delete product', variant: 'destructive' });
            }
        }
    };

    // Handle image upload
    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!editingProduct || !e.target.files || e.target.files.length === 0) return;

        const file = e.target.files[0];
        if (!file.type.startsWith('image/')) {
            toast({ title: 'Please select an image file', variant: 'destructive' });
            return;
        }

        // Max 5MB
        if (file.size > 5 * 1024 * 1024) {
            toast({ title: 'Image must be less than 5MB', variant: 'destructive' });
            return;
        }

        setIsUploading(true);
        try {
            const isPrimary = !editingProduct.images || editingProduct.images.length === 0;
            await uploadImage.mutateAsync({
                productId: editingProduct.id,
                file,
                category: editingProduct.category,
                isPrimary
            });
            toast({ title: 'Image uploaded successfully' });
        } catch (error: any) {
            console.error('Upload error:', error);
            toast({
                title: 'Failed to upload image',
                description: error?.message || 'Check that the storage bucket exists',
                variant: 'destructive'
            });
        } finally {
            setIsUploading(false);
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
    };

    // Handle image delete
    const handleImageDelete = async (image: Tables<'product_images'>) => {
        if (!confirm('Delete this image?')) return;

        try {
            await deleteImage.mutateAsync({ id: image.id, url: image.url });
            toast({ title: 'Image deleted' });
        } catch (error) {
            toast({ title: 'Failed to delete image', variant: 'destructive' });
        }
    };

    if (isLoading) {
        return (
            <div className="flex justify-center p-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h2 className="font-display text-lg font-semibold text-foreground">
                    Product Management
                </h2>
                <Button variant="gold" onClick={() => handleOpenDialog()}>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Product
                </Button>
            </div>

            <div className="bg-card rounded-xl shadow-soft overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-border bg-muted/30">
                                <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Product</th>
                                <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Category</th>
                                <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Price</th>
                                <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Status</th>
                                <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Flags</th>
                                <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {products?.map((product) => (
                                <tr key={product.id} className="border-b border-border last:border-0 hover:bg-muted/10 transition-colors">
                                    <td className="py-3 px-4">
                                        <div className="flex items-center gap-3">
                                            {product.images?.[0]?.url ? (
                                                <img
                                                    src={product.images[0].url}
                                                    alt={product.name}
                                                    className="w-10 h-10 rounded-lg object-cover"
                                                />
                                            ) : (
                                                <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                                                    <Package className="h-5 w-5 text-muted-foreground" />
                                                </div>
                                            )}
                                            <div>
                                                <span className="font-medium text-foreground">{product.name}</span>
                                                <div className="text-xs text-muted-foreground">{product.slug}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="py-3 px-4 text-sm">{product.category}</td>
                                    <td className="py-3 px-4">
                                        <div className="font-medium">{formatPrice(product.price)}</div>
                                        {product.original_price && (
                                            <div className="text-xs text-muted-foreground line-through">
                                                {formatPrice(product.original_price)}
                                            </div>
                                        )}
                                    </td>
                                    <td className="py-3 px-4">
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${product.in_stock ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                                            }`}>
                                            {product.in_stock ? 'In Stock' : 'Out of Stock'}
                                        </span>
                                    </td>
                                    <td className="py-3 px-4">
                                        <div className="flex gap-1 flex-wrap">
                                            {product.is_featured && (
                                                <span className="px-2 py-0.5 rounded text-xs bg-blue-100 text-blue-700">Featured</span>
                                            )}
                                            {product.is_bestseller && (
                                                <span className="px-2 py-0.5 rounded text-xs bg-amber-100 text-amber-700">Bestseller</span>
                                            )}
                                            {product.is_new && (
                                                <span className="px-2 py-0.5 rounded text-xs bg-purple-100 text-purple-700">New</span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="py-3 px-4">
                                        <div className="flex justify-end gap-2">
                                            <Button variant="ghost" size="icon" onClick={() => handleOpenDialog(product)}>
                                                <Edit className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="text-destructive"
                                                onClick={() => handleDelete(product.id, product.name)}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {products?.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="py-8 text-center text-muted-foreground">
                                        No products found. Add one to get started.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Create/Edit Dialog */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>{editingProduct ? 'Edit Product' : 'Add New Product'}</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleSubmit} className="space-y-4 py-4">
                        {/* Basic Info */}
                        <div className="space-y-2">
                            <Label htmlFor="name">Product Name *</Label>
                            <Input
                                id="name"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                placeholder="e.g. Darjeeling First Flush"
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="description">Short Description</Label>
                            <Input
                                id="description"
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                placeholder="Brief product description"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="long_description">Long Description</Label>
                            <Textarea
                                id="long_description"
                                value={formData.long_description}
                                onChange={(e) => setFormData({ ...formData, long_description: e.target.value })}
                                placeholder="Detailed product description"
                                rows={3}
                            />
                        </div>

                        {/* Pricing */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="price">Price (₹) *</Label>
                                <Input
                                    id="price"
                                    type="number"
                                    value={formData.price}
                                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                    placeholder="1499"
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="original_price">Original Price (₹)</Label>
                                <Input
                                    id="original_price"
                                    type="number"
                                    value={formData.original_price}
                                    onChange={(e) => setFormData({ ...formData, original_price: e.target.value })}
                                    placeholder="1999"
                                />
                            </div>
                        </div>

                        {/* Category & Weight */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="category">Category *</Label>
                                <Select
                                    value={formData.category}
                                    onValueChange={(value) => setFormData({ ...formData, category: value })}
                                >
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        {categories?.map((cat) => (
                                            <SelectItem key={cat.id} value={cat.name}>{cat.name}</SelectItem>
                                        )) || (
                                                <>
                                                    <SelectItem value="Black Tea">Black Tea</SelectItem>
                                                    <SelectItem value="Green Tea">Green Tea</SelectItem>
                                                    <SelectItem value="White Tea">White Tea</SelectItem>
                                                    <SelectItem value="Oolong Tea">Oolong Tea</SelectItem>
                                                    <SelectItem value="Herbal Tea">Herbal Tea</SelectItem>
                                                    <SelectItem value="Chai Blends">Chai Blends</SelectItem>
                                                    <SelectItem value="Specialty Tea">Specialty Tea</SelectItem>
                                                </>
                                            )}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="weight">Weight</Label>
                                <Input
                                    id="weight"
                                    value={formData.weight}
                                    onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                                    placeholder="100g"
                                />
                            </div>
                        </div>

                        {/* Origin */}
                        <div className="space-y-2">
                            <Label htmlFor="origin">Origin</Label>
                            <Input
                                id="origin"
                                value={formData.origin}
                                onChange={(e) => setFormData({ ...formData, origin: e.target.value })}
                                placeholder="Darjeeling, India"
                            />
                        </div>

                        {/* Brewing Info */}
                        <div className="grid grid-cols-3 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="brewing_temp">Brewing Temp</Label>
                                <Input
                                    id="brewing_temp"
                                    value={formData.brewing_temp}
                                    onChange={(e) => setFormData({ ...formData, brewing_temp: e.target.value })}
                                    placeholder="85-90°C"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="brewing_time">Brewing Time</Label>
                                <Input
                                    id="brewing_time"
                                    value={formData.brewing_time}
                                    onChange={(e) => setFormData({ ...formData, brewing_time: e.target.value })}
                                    placeholder="3-4 min"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="brewing_amount">Amount</Label>
                                <Input
                                    id="brewing_amount"
                                    value={formData.brewing_amount}
                                    onChange={(e) => setFormData({ ...formData, brewing_amount: e.target.value })}
                                    placeholder="2g/cup"
                                />
                            </div>
                        </div>

                        {/* Flags */}
                        <div className="flex flex-wrap gap-4 pt-2">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    className="h-4 w-4 rounded border-gray-300"
                                    checked={formData.in_stock}
                                    onChange={(e) => setFormData({ ...formData, in_stock: e.target.checked })}
                                />
                                <span className="text-sm">In Stock</span>
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    className="h-4 w-4 rounded border-gray-300"
                                    checked={formData.is_featured}
                                    onChange={(e) => setFormData({ ...formData, is_featured: e.target.checked })}
                                />
                                <span className="text-sm">Featured</span>
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    className="h-4 w-4 rounded border-gray-300"
                                    checked={formData.is_bestseller}
                                    onChange={(e) => setFormData({ ...formData, is_bestseller: e.target.checked })}
                                />
                                <span className="text-sm">Bestseller</span>
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    className="h-4 w-4 rounded border-gray-300"
                                    checked={formData.is_new}
                                    onChange={(e) => setFormData({ ...formData, is_new: e.target.checked })}
                                />
                                <span className="text-sm">New</span>
                            </label>
                        </div>

                        {/* Product Images - Only show for existing products */}
                        {editingProduct && (
                            <div className="space-y-3 pt-4 border-t">
                                <div className="flex items-center justify-between">
                                    <Label>Product Images</Label>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={() => fileInputRef.current?.click()}
                                        disabled={isUploading}
                                    >
                                        {isUploading ? (
                                            <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                        ) : (
                                            <Upload className="h-4 w-4 mr-2" />
                                        )}
                                        {isUploading ? 'Uploading...' : 'Upload Image'}
                                    </Button>
                                    <input
                                        type="file"
                                        ref={fileInputRef}
                                        onChange={handleImageUpload}
                                        accept="image/*"
                                        className="hidden"
                                    />
                                </div>

                                {/* Display existing images */}
                                <div className="grid grid-cols-3 gap-3">
                                    {editingProduct.images?.map((image) => (
                                        <div key={image.id} className="relative group">
                                            <img
                                                src={image.url}
                                                alt="Product"
                                                className="w-full h-24 object-cover rounded-lg border"
                                            />
                                            {image.is_primary && (
                                                <span className="absolute top-1 left-1 px-1.5 py-0.5 bg-primary text-primary-foreground text-xs rounded">
                                                    Primary
                                                </span>
                                            )}
                                            <button
                                                type="button"
                                                onClick={() => handleImageDelete(image)}
                                                className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                            >
                                                <X className="h-3 w-3" />
                                            </button>
                                        </div>
                                    ))}
                                    {(!editingProduct.images || editingProduct.images.length === 0) && (
                                        <div className="col-span-3 py-6 text-center text-muted-foreground border border-dashed rounded-lg">
                                            <ImageIcon className="h-8 w-8 mx-auto mb-2 opacity-50" />
                                            <p className="text-sm">No images uploaded yet</p>
                                        </div>
                                    )}
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    First uploaded image will be set as primary. Max 5MB per image.
                                </p>
                            </div>
                        )}

                        {/* Note for new products */}
                        {!editingProduct && (
                            <div className="pt-4 border-t">
                                <p className="text-sm text-muted-foreground flex items-center gap-2">
                                    <ImageIcon className="h-4 w-4" />
                                    You can add images after creating the product.
                                </p>
                            </div>
                        )}
                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                            <Button type="submit" variant="gold" disabled={createProduct.isPending || updateProduct.isPending}>
                                {(createProduct.isPending || updateProduct.isPending) ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                ) : editingProduct ? 'Update Product' : 'Add Product'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
}
