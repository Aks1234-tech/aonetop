import { useState } from 'react';
import { Plus, Edit, Trash2, Tag, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
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
import { useAdminOffers, useCreateOffer, useUpdateOffer, useDeleteOffer } from '@/hooks/useOffers';
import { Tables } from '@/lib/supabase';

// Helper for currency
const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        minimumFractionDigits: 0,
    }).format(price);
};

export function OffersManager() {
    const { data: offers, isLoading } = useAdminOffers();
    const createOffer = useCreateOffer();
    const updateOffer = useUpdateOffer();
    const deleteOffer = useDeleteOffer();
    const { toast } = useToast();

    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingOffer, setEditingOffer] = useState<Tables<'offers'> | null>(null);

    // Form State
    const [formData, setFormData] = useState({
        name: '',
        code: '',
        type: 'percentage',
        value: '',
        min_order_value: '',
        usage_limit: '',
        per_user_limit: '',
        starts_at: '',
        ends_at: '',
        is_active: true,
    });

    const resetForm = () => {
        setFormData({
            name: '',
            code: '',
            type: 'percentage',
            value: '',
            min_order_value: '',
            usage_limit: '',
            per_user_limit: '',
            starts_at: '',
            ends_at: '',
            is_active: true,
        });
        setEditingOffer(null);
    };

    const handleOpenDialog = (offer?: Tables<'offers'>) => {
        if (offer) {
            setEditingOffer(offer);
            setFormData({
                name: offer.name,
                code: offer.code || '',
                type: offer.type,
                value: offer.value?.toString() || '',
                min_order_value: offer.min_order_value ? (offer.min_order_value / 100).toString() : '',
                usage_limit: offer.usage_limit?.toString() || '',
                per_user_limit: (offer as any).per_user_limit?.toString() || '',
                starts_at: offer.starts_at ? new Date(offer.starts_at).toISOString().split('T')[0] : '',
                ends_at: offer.ends_at ? new Date(offer.ends_at).toISOString().split('T')[0] : '',
                is_active: offer.is_active,
            });
        } else {
            resetForm();
        }
        setIsDialogOpen(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Basic validation
        if (!formData.name || !formData.type || !formData.value) {
            toast({ title: 'Please fill required fields', variant: 'destructive' });
            return;
        }

        const offerData = {
            name: formData.name,
            code: formData.code.toUpperCase() || null,
            type: formData.type,
            value: parseFloat(formData.value),
            min_order_value: formData.min_order_value ? parseFloat(formData.min_order_value) * 100 : null, // Convert to paise
            usage_limit: formData.usage_limit ? parseInt(formData.usage_limit) : null,
            per_user_limit: formData.per_user_limit ? parseInt(formData.per_user_limit) : null,
            starts_at: formData.starts_at ? new Date(formData.starts_at).toISOString() : null,
            ends_at: formData.ends_at ? new Date(formData.ends_at).toISOString() : null,
            is_active: formData.is_active,
            applies_to: 'all', // Simplified for now
        };

        try {
            if (editingOffer) {
                await updateOffer.mutateAsync({ id: editingOffer.id, updates: offerData });
                toast({ title: 'Offer updated successfully' });
            } else {
                await createOffer.mutateAsync(offerData);
                toast({ title: 'Offer created successfully' });
            }
            setIsDialogOpen(false);
            resetForm();
        } catch (error) {
            console.error(error);
            toast({ title: 'Failed to save offer', variant: 'destructive' });
        }
    };

    const handleDelete = async (id: string) => {
        if (confirm('Are you sure you want to delete this offer?')) {
            try {
                await deleteOffer.mutateAsync(id);
                toast({ title: 'Offer deleted successfully' });
            } catch (error) {
                toast({ title: 'Failed to delete offer', variant: 'destructive' });
            }
        }
    };

    if (isLoading) {
        return <div className="flex justify-center p-8"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
    }

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h2 className="font-display text-lg font-semibold text-foreground">
                    Offer Management
                </h2>
                <Button variant="gold" onClick={() => handleOpenDialog()}>
                    <Plus className="mr-2 h-4 w-4" />
                    Create Offer
                </Button>
            </div>

            <div className="bg-card rounded-xl shadow-soft overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-border bg-muted/30">
                                <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Code</th>
                                <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Type</th>
                                <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Value</th>
                                <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Min Order</th>
                                <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Usage</th>
                                <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Status</th>
                                <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {offers?.map((offer) => (
                                <tr key={offer.id} className="border-b border-border last:border-0 hover:bg-muted/10 transition-colors">
                                    <td className="py-3 px-4">
                                        <div className="flex items-center gap-2">
                                            <Tag className="h-4 w-4 text-primary" />
                                            <span className="font-medium font-display">{offer.code || <span className="text-muted-foreground italic">No Code</span>}</span>
                                        </div>
                                        <div className="text-xs text-muted-foreground mt-0.5">{offer.name}</div>
                                    </td>
                                    <td className="py-3 px-4 text-sm capitalize">{offer.type.replace('_', ' ')}</td>
                                    <td className="py-3 px-4 font-medium">
                                        {offer.type === 'percentage' ? `${offer.value}%` : formatPrice(offer.value || 0)}
                                    </td>
                                    <td className="py-3 px-4 text-sm text-muted-foreground">
                                        {offer.min_order_value ? formatPrice(offer.min_order_value / 100) : '-'}
                                    </td>
                                    <td className="py-3 px-4 text-sm">
                                        {offer.used_count} / {offer.usage_limit || '∞'}
                                    </td>
                                    <td className="py-3 px-4">
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${offer.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                                            }`}>
                                            {offer.is_active ? 'Active' : 'Inactive'}
                                        </span>
                                    </td>
                                    <td className="py-3 px-4">
                                        <div className="flex justify-end gap-2">
                                            <Button variant="ghost" size="icon" onClick={() => handleOpenDialog(offer)}>
                                                <Edit className="h-4 w-4" />
                                            </Button>
                                            <Button variant="ghost" size="icon" className="text-destructive" onClick={() => handleDelete(offer.id)}>
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {offers?.length === 0 && (
                                <tr>
                                    <td colSpan={7} className="py-8 text-center text-muted-foreground">
                                        No offers found. Create one to get started.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Create/Edit Dialog */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                        <DialogTitle>{editingOffer ? 'Edit Offer' : 'Create New Offer'}</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleSubmit} className="space-y-4 py-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="name">Internal Name</Label>
                                <Input
                                    id="name"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    placeholder="e.g. Summer Sale"
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="code">Promo Code</Label>
                                <Input
                                    id="code"
                                    value={formData.code}
                                    onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                                    placeholder="SUMMER2024"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="type">Discount Type</Label>
                                <Select
                                    value={formData.type}
                                    onValueChange={(value) => setFormData({ ...formData, type: value })}
                                >
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="percentage">Percentage (%)</SelectItem>
                                        <SelectItem value="fixed">Fixed Amount</SelectItem>
                                        <SelectItem value="free_shipping">Free Shipping</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="value">Value</Label>
                                <Input
                                    id="value"
                                    type="number"
                                    value={formData.value}
                                    onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                                    placeholder={formData.type === 'percentage' ? '20' : '100'}
                                    required={formData.type !== 'free_shipping'}
                                    disabled={formData.type === 'free_shipping'}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="min_order">Min Order (₹)</Label>
                                <Input
                                    id="min_order"
                                    type="number"
                                    value={formData.min_order_value}
                                    onChange={(e) => setFormData({ ...formData, min_order_value: e.target.value })}
                                    placeholder="999"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="usage_limit">Total Usage Limit</Label>
                                <Input
                                    id="usage_limit"
                                    type="number"
                                    value={formData.usage_limit}
                                    onChange={(e) => setFormData({ ...formData, usage_limit: e.target.value })}
                                    placeholder="100"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="per_user_limit">Per-User Limit (optional)</Label>
                            <Input
                                id="per_user_limit"
                                type="number"
                                value={formData.per_user_limit}
                                onChange={(e) => setFormData({ ...formData, per_user_limit: e.target.value })}
                                placeholder="e.g. 1 - allows each user to use offer once"
                            />
                            <p className="text-xs text-muted-foreground">Leave empty for unlimited per-user usage</p>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="starts_at">Start Date</Label>
                                <Input
                                    id="starts_at"
                                    type="date"
                                    value={formData.starts_at}
                                    onChange={(e) => setFormData({ ...formData, starts_at: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="ends_at">End Date</Label>
                                <Input
                                    id="ends_at"
                                    type="date"
                                    value={formData.ends_at}
                                    onChange={(e) => setFormData({ ...formData, ends_at: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="flex items-center space-x-2 pt-2">
                            <input
                                type="checkbox"
                                id="is_active"
                                className="h-4 w-4 rounded border-gray-300"
                                checked={formData.is_active}
                                onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                            />
                            <Label htmlFor="is_active">Active</Label>
                        </div>

                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                            <Button type="submit" variant="gold">
                                {createOffer.isPending || updateOffer.isPending ? <Loader2 className="animate-spin" /> : 'Save Offer'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
}
