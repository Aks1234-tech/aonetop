import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

// --- Types ---

export interface HeroSlide {
    id: number;
    title: string;
    subtitle: string;
    buttonText: string;
    buttonLink: string;
    backgroundImage: string;
}

export interface SiteLogo {
    url: string; // If empty, use default text/icon
    alt: string;
}

export interface SiteContent {
    logo: SiteLogo;
    heroSlides: HeroSlide[];
    brandImages: string[];
}

// --- Defaults ---

const defaultHeroSlides: HeroSlide[] = [
    {
        id: 1,
        title: 'Premium Organic Tea',
        subtitle: 'Handpicked from the finest plantations',
        buttonText: 'Explore Tea Collection',
        buttonLink: '/shop?category=tea',
        backgroundImage: '/src/images/home page/Tea_1C.png',
    },
    {
        id: 2,
        title: 'Pure Golden Ghee',
        subtitle: 'Traditional purity in every jar',
        buttonText: 'Discover Ghee',
        buttonLink: '/shop?category=ghee',
        backgroundImage: '/src/images/home page/Ghee_2C.png',
    },
    {
        id: 3,
        title: '100% Raw Natural Honey',
        subtitle: 'Sweet essence from nature',
        buttonText: 'Shop Honey',
        buttonLink: '/shop?category=honey',
        backgroundImage: '/src/images/home page/Honey_3C.png',
    },
];

const defaultBrandImages = [
    'https://images.unsplash.com/photo-1641997825978-5f8d5da5a4a1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxvcmdhbmljJTIwdGVhJTIwbGVhdmVzfGVufDF8fHx8MTc2OTg4MDkzNnww&ixlib=rb-4.1.0&q=80&w=1080',
    'https://images.unsplash.com/photo-1691480208637-6ed63aac6694?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwdXJlJTIwaG9uZXklMjBqYXJ8ZW58MXx8fHwxNzY5ODgwOTM2fDA&ixlib=rb-4.1.0&q=80&w=1080',
    'https://images.unsplash.com/photo-1573812461383-e5f8b759d12e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxnaGVlJTIwY2xhcmlmaWVkJTIwYnV0dGVyfGVufDF8fHx8MTc2OTg4MDkzN3ww&ixlib=rb-4.1.0&q=80&w=1080',
    'https://images.unsplash.com/photo-1765809255360-6ed6240bd10f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxoZXJiYWwlMjB0ZWElMjBjb2xsZWN0aW9ufGVufDF8fHx8MTc2OTg4MDkzN3ww&ixlib=rb-4.1.0&q=80&w=1080',
    'https://images.unsplash.com/photo-1730190168042-3bef4553a8f4?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxvcmdhbmljJTIwYmVla2VlcGluZyUyMGhvbmV5fGVufDF8fHx8MTc2OTg4MDkzOHww&ixlib=rb-4.1.0&q=80&w=1080',
];

const defaultContent: SiteContent = {
    logo: { url: '', alt: '9 Planet Impex' },
    heroSlides: defaultHeroSlides,
    brandImages: defaultBrandImages,
};

const FILE_PATH = 'site-settings/content.json';
const BUCKET = 'content-images'; // Changed from product-images

// --- Helpers ---

// Helper to extract path from a full URL
const getPathFromUrl = (url: string) => {
    try {
        const urlObj = new URL(url);
        // Path usually looks like /storage/v1/object/public/bucket-name/folder/file.jpg
        // We need 'folder/file.jpg'
        const pathParts = urlObj.pathname.split(`/${BUCKET}/`);
        if (pathParts.length > 1) {
            return decodeURIComponent(pathParts[1]);
        }
        return null;
    } catch (e) {
        return null;
    }
};

// --- Hooks ---

export function useSiteContent() {
    return useQuery({
        queryKey: ['site-content'],
        queryFn: async (): Promise<SiteContent> => {
            try {
                console.log('[useSiteContent] Fetching content.json...');

                // Method 1: Try direct download (most fresh)
                const { data, error } = await supabase.storage
                    .from(BUCKET)
                    .download(FILE_PATH);

                if (error) {
                    console.warn('[useSiteContent] Download failed:', error.message);

                    // Method 2: Try fetching public URL (fallback for RLS issues)
                    console.log('[useSiteContent] Trying public URL fallback...');
                    const { data: publicData } = supabase.storage.from(BUCKET).getPublicUrl(FILE_PATH);
                    const response = await fetch(`${publicData.publicUrl}?t=${Date.now()}`);

                    if (response.ok) {
                        const json = await response.json();
                        console.log('[useSiteContent] Public URL fetch success');
                        return {
                            ...defaultContent,
                            ...json,
                            heroSlides: json.heroSlides || defaultHeroSlides,
                            brandImages: json.brandImages || defaultBrandImages,
                            logo: json.logo || defaultContent.logo,
                        };
                    }

                    console.warn('[useSiteContent] All fetch methods failed. Using defaults.');
                    return defaultContent;
                }

                const text2 = await data.text();
                const json2 = JSON.parse(text2);
                console.log('[useSiteContent] Download success');

                return {
                    ...defaultContent,
                    ...json2,
                    heroSlides: json2.heroSlides || defaultHeroSlides,
                    brandImages: json2.brandImages || defaultBrandImages,
                    logo: json2.logo || defaultContent.logo,
                };

            } catch (err) {
                console.error('[useSiteContent] Error parsing content:', err);
                return defaultContent;
            }
        },
        staleTime: 1000 * 60 * 5,
    });
}

export function useUpdateSiteContent() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (newContent: SiteContent) => {
            const blob = new Blob([JSON.stringify(newContent, null, 2)], {
                type: 'application/json',
            });

            const { error } = await supabase.storage
                .from(BUCKET)
                .upload(FILE_PATH, blob, {
                    upsert: true,
                    contentType: 'application/json',
                    cacheControl: '0',
                });

            if (error) throw error;
            return newContent;
        },
        onSuccess: (data) => {
            queryClient.setQueryData(['site-content'], data);
            queryClient.invalidateQueries({ queryKey: ['site-content'] });
        },
    });
}

export function useUploadSiteImage() {
    return useMutation({
        mutationFn: async ({
            file,
            folder,
            previousUrl
        }: {
            file: File;
            folder: 'home-slider' | 'about-slider' | 'logo';
            previousUrl?: string
        }) => {

            // 1. Delete previous image if it exists and belongs to this bucket
            if (previousUrl) {
                const previousPath = getPathFromUrl(previousUrl);
                if (previousPath) {
                    console.log('[useUploadSiteImage] Deleting previous image:', previousPath);
                    await supabase.storage.from(BUCKET).remove([previousPath]);
                }
            }

            // 2. Upload new image
            const fileExt = file.name.split('.').pop();
            // If folder is 'logo', we might put at root or in logo/ folder?
            // User said "for logo it upload under content-images". 
            // This implies root of content-images. 
            // However, to keep it clean, if I use a folder prefix it's "cleaner".
            // But let's follow instruction strictly if possible.
            // "upload under content-images" = root?
            // "two sub-bucket inside it called (home-slider and about-slider)"
            // This structure implies 3 locations: /home-slider/, /about-slider/, and / (for logo).

            let filePath = '';
            const uniqueId = `${Date.now()}-${Math.random().toString(36).substring(7)}`;

            if (folder === 'logo') {
                filePath = `${uniqueId}.${fileExt}`; // Root
            } else {
                filePath = `${folder}/${uniqueId}.${fileExt}`;
            }

            const { error: uploadError } = await supabase.storage
                .from(BUCKET)
                .upload(filePath, file, {
                    cacheControl: '31536000',
                    upsert: false,
                });

            if (uploadError) throw uploadError;

            const { data: { publicUrl } } = supabase.storage
                .from(BUCKET)
                .getPublicUrl(filePath);

            return publicUrl;
        },
    });
}
