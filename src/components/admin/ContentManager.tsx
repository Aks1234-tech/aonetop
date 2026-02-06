import { useState, useRef } from 'react';
import { Loader2, Save, Upload, Plus, Trash2, Image as ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useSiteContent, useUpdateSiteContent, useUploadSiteImage, SiteContent, HeroSlide } from '@/hooks/useSiteContent';
import { useToast } from '@/hooks/use-toast';

export function ContentManager() {
    const { data: content, isLoading } = useSiteContent();
    const updateContent = useUpdateSiteContent();
    const uploadImage = useUploadSiteImage();
    const { toast } = useToast();

    const [activeTab, setActiveTab] = useState('general');
    // Local state to manage form changes before saving
    const [localContent, setLocalContent] = useState<SiteContent | null>(null);
    const [isUploading, setIsUploading] = useState(false);

    // Sync local state with fetched data
    if (content && !localContent && !isLoading) {
        setLocalContent(content);
    }

    const handleSave = async () => {
        if (!localContent) return;
        console.log('[ContentManager] Saving content:', localContent);
        try {
            await updateContent.mutateAsync(localContent);
            toast({ title: 'Site content updated successfully' });
        } catch (error) {
            console.error(error);
            toast({ title: 'Failed to save changes', variant: 'destructive' });
        }
    };

    /* Updated to support deleting previous image */
    const handleImageUpload = async (
        e: React.ChangeEvent<HTMLInputElement>,
        folder: 'home-slider' | 'about-slider' | 'logo',
        onSuccess: (url: string) => void,
        previousUrl?: string
    ) => {
        if (!e.target.files || e.target.files.length === 0) return;
        const file = e.target.files[0];

        setIsUploading(true);
        try {
            const url = await uploadImage.mutateAsync({ file, folder, previousUrl });
            onSuccess(url);
            toast({ title: 'Image uploaded successfully' });
        } catch (error: any) {
            console.error(error);
            toast({
                title: 'Failed to upload image',
                description: error.message || 'Check if "content-images" bucket exists.',
                variant: 'destructive'
            });
        } finally {
            setIsUploading(false);
            e.target.value = ''; // Reset input
        }
    };

    if (isLoading || !localContent) {
        return (
            <div className="flex justify-center p-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">Site Content</h2>
                    <p className="text-muted-foreground">Manage logos, sliders, and brand images.</p>
                </div>
                <Button onClick={handleSave} disabled={updateContent.isPending}>
                    {updateContent.isPending ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                        <Save className="mr-2 h-4 w-4" />
                    )}
                    Save Changes
                </Button>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
                <TabsList>
                    <TabsTrigger value="general">General & Logo</TabsTrigger>
                    <TabsTrigger value="hero">Home Slider</TabsTrigger>
                    <TabsTrigger value="brands">Brand Slider</TabsTrigger>
                </TabsList>

                {/* --- General Tab --- */}
                <TabsContent value="general">
                    <Card>
                        <CardHeader>
                            <CardTitle>Site Identity</CardTitle>
                            <CardDescription>Manage your site logo and basic settings.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="space-y-2">
                                <Label>Site Logo</Label>
                                <div className="flex items-start gap-6">
                                    <div className="border rounded-lg p-4 bg-muted/20 w-32 h-32 flex items-center justify-center overflow-hidden">
                                        {localContent.logo.url ? (
                                            <img src={localContent.logo.url} alt="Logo" className="max-w-full max-h-full object-contain" />
                                        ) : (
                                            <div className="text-center text-muted-foreground text-sm">
                                                <ImageIcon className="mx-auto h-8 w-8 mb-2 opacity-50" />
                                                No Logo
                                            </div>
                                        )}
                                    </div>
                                    <div className="space-y-4 flex-1">
                                        <div className="flex items-center gap-2">
                                            <Button variant="outline" disabled={isUploading} className="relative">
                                                {isUploading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Upload className="w-4 h-4 mr-2" />}
                                                Upload New Logo
                                                <input
                                                    type="file"
                                                    className="absolute inset-0 opacity-0 cursor-pointer"
                                                    accept="image/*"
                                                    onChange={(e) => handleImageUpload(e, 'logo', (url) => {
                                                        setLocalContent({
                                                            ...localContent,
                                                            logo: { ...localContent.logo, url }
                                                        });
                                                    }, localContent.logo.url)}
                                                />
                                            </Button>
                                            {localContent.logo.url && (
                                                <Button
                                                    variant="ghost"
                                                    className="text-destructive"
                                                    onClick={() => setLocalContent({
                                                        ...localContent,
                                                        logo: { ...localContent.logo, url: '' }
                                                    })}
                                                >
                                                    Remove
                                                </Button>
                                            )}
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="logo-alt">Alt Text</Label>
                                            <Input
                                                id="logo-alt"
                                                value={localContent.logo.alt}
                                                onChange={(e) => setLocalContent({
                                                    ...localContent,
                                                    logo: { ...localContent.logo, alt: e.target.value }
                                                })}
                                                placeholder="Site Name"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* --- Home Slider Tab --- */}
                <TabsContent value="hero">
                    <Card>
                        <CardHeader>
                            <CardTitle>Home Page Slider</CardTitle>
                            <CardDescription>Manage the main carousel on the home page.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {localContent.heroSlides.map((slide, index) => (
                                <div key={slide.id} className="border rounded-xl p-4 space-y-4 relative group">
                                    <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Button
                                            variant="destructive"
                                            size="icon"
                                            onClick={() => {
                                                const newSlides = localContent.heroSlides.filter(s => s.id !== slide.id);
                                                setLocalContent({ ...localContent, heroSlides: newSlides });
                                            }}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>

                                    <div className="grid md:grid-cols-[200px_1fr] gap-6">
                                        {/* Image */}
                                        <div className="space-y-2">
                                            <Label>Background Image</Label>
                                            <div className="rounded-lg border bg-muted/20 h-32 flex items-center justify-center overflow-hidden relative">
                                                <img src={slide.backgroundImage} alt={slide.title} className="w-full h-full object-cover" />
                                                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                                                    <Button variant="secondary" size="sm" className="relative">
                                                        Change
                                                        <input
                                                            type="file"
                                                            className="absolute inset-0 opacity-0 cursor-pointer"
                                                            accept="image/*"
                                                            onChange={(e) => handleImageUpload(e, 'home-slider', (url) => {
                                                                const newSlides = [...localContent.heroSlides];
                                                                newSlides[index] = { ...slide, backgroundImage: url };
                                                                setLocalContent({ ...localContent, heroSlides: newSlides });
                                                            }, slide.backgroundImage)}
                                                        />
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Content */}
                                        <div className="space-y-4">
                                            <div className="grid gap-4 sm:grid-cols-2">
                                                <div className="space-y-2">
                                                    <Label>Title</Label>
                                                    <Input
                                                        value={slide.title}
                                                        onChange={(e) => {
                                                            const newSlides = [...localContent.heroSlides];
                                                            newSlides[index] = { ...slide, title: e.target.value };
                                                            setLocalContent({ ...localContent, heroSlides: newSlides });
                                                        }}
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label>Subtitle</Label>
                                                    <Input
                                                        value={slide.subtitle}
                                                        onChange={(e) => {
                                                            const newSlides = [...localContent.heroSlides];
                                                            newSlides[index] = { ...slide, subtitle: e.target.value };
                                                            setLocalContent({ ...localContent, heroSlides: newSlides });
                                                        }}
                                                    />
                                                </div>
                                            </div>
                                            <div className="grid gap-4 sm:grid-cols-2">
                                                <div className="space-y-2">
                                                    <Label>Button Text</Label>
                                                    <Input
                                                        value={slide.buttonText}
                                                        onChange={(e) => {
                                                            const newSlides = [...localContent.heroSlides];
                                                            newSlides[index] = { ...slide, buttonText: e.target.value };
                                                            setLocalContent({ ...localContent, heroSlides: newSlides });
                                                        }}
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label>Button Link</Label>
                                                    <Input
                                                        value={slide.buttonLink}
                                                        onChange={(e) => {
                                                            const newSlides = [...localContent.heroSlides];
                                                            newSlides[index] = { ...slide, buttonLink: e.target.value };
                                                            setLocalContent({ ...localContent, heroSlides: newSlides });
                                                        }}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}

                            <Button
                                variant="outline"
                                className="w-full border-dashed"
                                onClick={() => {
                                    const newId = Math.max(0, ...localContent.heroSlides.map(s => s.id)) + 1;
                                    const newSlide: HeroSlide = {
                                        id: newId,
                                        title: 'New Slide',
                                        subtitle: 'Subtitle goes here',
                                        buttonText: 'Shop Now',
                                        buttonLink: '/shop',
                                        backgroundImage: 'https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=1200&q=80', // Default placeholder
                                    };
                                    setLocalContent({
                                        ...localContent,
                                        heroSlides: [...localContent.heroSlides, newSlide]
                                    });
                                }}
                            >
                                <Plus className="mr-2 h-4 w-4" /> Add Slide
                            </Button>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* --- Brand Slider Tab --- */}
                <TabsContent value="brands">
                    <Card>
                        <CardHeader>
                            <CardTitle>About Page Brands</CardTitle>
                            <CardDescription>Manage the brand logos displayed on the About page.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                                {localContent.brandImages.map((img, index) => (
                                    <div key={index} className="relative group aspect-video rounded-lg overflow-hidden border bg-muted/20">
                                        <img src={img} alt={`Brand ${index + 1}`} className="w-full h-full object-cover" />
                                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                            <Button
                                                variant="destructive"
                                                size="icon"
                                                onClick={() => {
                                                    const newBrands = localContent.brandImages.filter((_, i) => i !== index);
                                                    setLocalContent({ ...localContent, brandImages: newBrands });
                                                }}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                ))}

                                <div className="aspect-video rounded-lg border border-dashed flex items-center justify-center hover:bg-muted/50 transition-colors relative cursor-pointer">
                                    <div className="text-center p-4">
                                        {isUploading ? (
                                            <Loader2 className="mx-auto h-6 w-6 animate-spin text-muted-foreground" />
                                        ) : (
                                            <Plus className="mx-auto h-6 w-6 text-muted-foreground mb-2" />
                                        )}
                                        <span className="text-sm text-muted-foreground">Add Image</span>
                                    </div>
                                    <input
                                        type="file"
                                        className="absolute inset-0 opacity-0 cursor-pointer"
                                        accept="image/*"
                                        disabled={isUploading}
                                        onChange={(e) => handleImageUpload(e, 'about-slider', (url) => {
                                            setLocalContent({
                                                ...localContent,
                                                brandImages: [...localContent.brandImages, url]
                                            });
                                        })}
                                    />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
