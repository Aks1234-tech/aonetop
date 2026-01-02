import { useState } from 'react';
import { Plus, Edit, Trash2, FolderTree, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useCategories, useCreateCategory, useUpdateCategory, useDeleteCategory } from '@/hooks/useCategories';
import { Tables } from '@/lib/supabase';

export function CategoryManager() {
    const { data: categories, isLoading } = useCategories();
    const createCategory = useCreateCategory();
    const updateCategory = useUpdateCategory();
    const deleteCategory = useDeleteCategory();
    const { toast } = useToast();

    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingCategory, setEditingCategory] = useState<Tables<'categories'> | null>(null);

    // Form State
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        sort_order: '0',
    });

    const resetForm = () => {
        setFormData({
            name: '',
            description: '',
            sort_order: '0',
        });
        setEditingCategory(null);
    };

    const handleOpenDialog = (category?: Tables<'categories'>) => {
        if (category) {
            setEditingCategory(category);
            setFormData({
                name: category.name,
                description: category.description || '',
                sort_order: category.sort_order?.toString() || '0',
            });
        } else {
            resetForm();
        }
        setIsDialogOpen(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Basic validation
        if (!formData.name) {
            toast({ title: 'Please enter a category name', variant: 'destructive' });
            return;
        }

        const categoryData = {
            name: formData.name,
            description: formData.description || null,
            sort_order: parseInt(formData.sort_order) || 0,
        };

        try {
            if (editingCategory) {
                await updateCategory.mutateAsync({ id: editingCategory.id, updates: categoryData });
                toast({ title: 'Category updated successfully' });
            } else {
                await createCategory.mutateAsync(categoryData);
                toast({ title: 'Category created successfully' });
            }
            setIsDialogOpen(false);
            resetForm();
        } catch (error: any) {
            console.error(error);
            const errorMessage = error?.message || 'Failed to save category';
            toast({ title: errorMessage, variant: 'destructive' });
        }
    };

    const handleDelete = async (id: string) => {
        if (confirm('Are you sure you want to delete this category? This will fail if products are using this category.')) {
            try {
                await deleteCategory.mutateAsync(id);
                toast({ title: 'Category deleted successfully' });
            } catch (error: any) {
                console.error(error);
                const errorMessage = error?.message?.includes('foreign key')
                    ? 'Cannot delete category - products are still using it'
                    : 'Failed to delete category';
                toast({ title: errorMessage, variant: 'destructive' });
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
                    Category Management
                </h2>
                <Button variant="gold" onClick={() => handleOpenDialog()}>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Category
                </Button>
            </div>

            <div className="bg-card rounded-xl shadow-soft overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-border bg-muted/30">
                                <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">ID</th>
                                <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Name</th>
                                <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Description</th>
                                <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Sort Order</th>
                                <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {categories?.map((category) => (
                                <tr key={category.id} className="border-b border-border last:border-0 hover:bg-muted/10 transition-colors">
                                    <td className="py-3 px-4">
                                        <div className="flex items-center gap-2">
                                            <FolderTree className="h-4 w-4 text-primary" />
                                            <span className="font-mono text-sm text-muted-foreground">{category.id}</span>
                                        </div>
                                    </td>
                                    <td className="py-3 px-4">
                                        <span className="font-medium font-display">{category.name}</span>
                                    </td>
                                    <td className="py-3 px-4 text-sm text-muted-foreground max-w-md">
                                        {category.description || <span className="italic">No description</span>}
                                    </td>
                                    <td className="py-3 px-4 text-sm">
                                        {category.sort_order}
                                    </td>
                                    <td className="py-3 px-4">
                                        <div className="flex justify-end gap-2">
                                            <Button variant="ghost" size="icon" onClick={() => handleOpenDialog(category)}>
                                                <Edit className="h-4 w-4" />
                                            </Button>
                                            <Button variant="ghost" size="icon" className="text-destructive" onClick={() => handleDelete(category.id)}>
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {categories?.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="py-8 text-center text-muted-foreground">
                                        No categories found. Create one to get started.
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
                        <DialogTitle>{editingCategory ? 'Edit Category' : 'Create New Category'}</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleSubmit} className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">Category Name *</Label>
                            <Input
                                id="name"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                placeholder="e.g. Green Tea"
                                required
                            />
                            <p className="text-xs text-muted-foreground">
                                A unique ID will be generated from this name
                            </p>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="description">Description</Label>
                            <Textarea
                                id="description"
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                placeholder="Brief description of this category"
                                rows={3}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="sort_order">Sort Order</Label>
                            <Input
                                id="sort_order"
                                type="number"
                                value={formData.sort_order}
                                onChange={(e) => setFormData({ ...formData, sort_order: e.target.value })}
                                placeholder="0"
                            />
                            <p className="text-xs text-muted-foreground">
                                Lower numbers appear first
                            </p>
                        </div>

                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                            <Button type="submit" variant="gold">
                                {createCategory.isPending || updateCategory.isPending ? <Loader2 className="animate-spin" /> : 'Save Category'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
}
