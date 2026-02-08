export interface Product {
  id: string;
  name: string;
  description: string;
  longDescription: string;
  price: number;
  originalPrice?: number;
  image: string;
  images: string[];
  category: string;
  tags: string[];
  weight: string;
  // origin: string;
  // brewingInstructions: {
  //   temperature: string;
  //   steepTime: string;
  //   amount: string;
  // };
  inStock: boolean;
  isBestseller?: boolean;
  isFeatured?: boolean;
  isNew?: boolean;
  rating: number;
  reviews: number;
}

export const products: Product[] = [
  // {
  //   id: "darjeeling-first-flush",
  //   name: "Masala Chai",
  //   description: "The champagne of teas, harvested in early spring with delicate muscatel notes",
  //   longDescription: "Our Darjeeling First Flush is sourced from the pristine gardens of the Himalayan foothills. This exquisite tea is harvested during the first plucking season, producing leaves that yield a light, floral cup with distinctive muscatel characteristics. The pale golden liquor offers a refined complexity that tea connoisseurs treasure.",
  //   price: 125,
  //   originalPrice: 135,
  //   image: "D:\aonetop\src\images\home page\Masala_Chai.png",
  //   images: [
  //     "https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=800&q=80",
  //     "https://images.unsplash.com/photo-1564890369478-c89ca6d9cde9?w=800&q=80",
  //   ],
  //   category: "Black Tea",
  //   tags: ["organic", "premium", "single-origin"],
  //   weight: "100g",
  //   inStock: true,
  //   isBestseller: true,
  //   isFeatured: true,
  //   rating: 4.9,
  //   reviews: 128,
  // },
  // {
  //   id: "assam-golden-tips",
  //   name: "Assam Golden Tips",
  //   description: "Rich, malty breakfast tea with golden tips from the finest Assam gardens",
  //   longDescription: "This exceptional Assam tea features an abundance of golden tips, indicating the highest quality leaves. Grown in the lush valleys of Assam, this tea delivers a robust, full-bodied cup with distinctive malty undertones and a smooth, honeyed finish perfect for starting your day.",
  //   price: 1899,
  //   image: "https://images.unsplash.com/photo-1597318181409-cf64d0b5d8a2?w=800&q=80",
  //   images: [
  //     "https://images.unsplash.com/photo-1597318181409-cf64d0b5d8a2?w=800&q=80",
  //   ],
  //   category: "Black Tea",
  //   tags: ["organic", "breakfast", "strong"],
  //   weight: "100g",
  //   inStock: true,
  //   isBestseller: true,
  //   rating: 4.8,
  //   reviews: 95,
  // },
  // {
  //   id: "nilgiri-blue-mountain",
  //   name: "Nilgiri Blue Mountain",
  //   description: "Fragrant, bright tea from the Blue Mountains with fruity undertones",
  //   longDescription: "Grown at elevations above 6,000 feet in the Nilgiri Blue Mountains, this exceptional tea offers a unique character. The cool, misty climate produces leaves that yield a bright, aromatic cup with subtle fruity notes and a clean, refreshing finish.",
  //   price: 1699,
  //   image: "https://images.unsplash.com/photo-1571934811356-5cc061b6821f?w=800&q=80",
  //   images: [
  //     "https://images.unsplash.com/photo-1571934811356-5cc061b6821f?w=800&q=80",
  //   ],
  //   category: "Black Tea",
  //   tags: ["organic", "high-altitude", "fruity"],
  //   weight: "100g",
  //   inStock: true,
  //   isFeatured: true,
  //   rating: 4.7,
  //   reviews: 67,
  // },
  // {
  //   id: "kashmiri-kahwa",
  //   name: "Kashmiri Kahwa",
  //   description: "Traditional Kashmiri green tea with saffron, almonds, and warm spices",
  //   longDescription: "This authentic Kashmiri Kahwa brings the warmth of the Himalayan tradition to your cup. Crafted with premium green tea, precious saffron strands, crushed almonds, cinnamon, and cardamom, this aromatic blend offers a luxurious, warming experience that's been cherished for centuries.",
  //   price: 2199,
  //   image: "https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=800&q=80",
  //   images: [
  //     "https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=800&q=80",
  //   ],
  //   category: "Specialty Tea",
  //   tags: ["spiced", "traditional", "saffron"],
  //   weight: "75g",
  //   inStock: true,
  //   isBestseller: true,
  //   isNew: true,
  //   rating: 4.9,
  //   reviews: 156,
  // },
  // {
  //   id: "masala-chai-blend",
  //   name: "Royal Masala Chai",
  //   description: "Authentic spiced tea blend with ginger, cardamom, cinnamon, and cloves",
  //   longDescription: "Our Royal Masala Chai is a carefully crafted blend of robust Assam tea and traditional Indian spices. Each sip delivers the perfect balance of bold tea flavor and aromatic spices, creating an invigorating experience that's equally delightful with milk or on its own.",
  //   price: 1499,
  //   image: "https://images.unsplash.com/photo-1561336526-2914f13ceb36?w=800&q=80",
  //   images: [
  //     "https://images.unsplash.com/photo-1561336526-2914f13ceb36?w=800&q=80",
  //   ],
  //   category: "Chai Blends",
  //   tags: ["spiced", "traditional", "strong"],
  //   weight: "150g",
  //   inStock: true,
  //   isBestseller: true,
  //   isFeatured: true,
  //   rating: 4.8,
  //   reviews: 234,
  // },
  // {
  //   id: "himalayan-green",
  //   name: "Himalayan Green Tea",
  //   description: "Delicate, vegetal green tea from high-altitude Himalayan gardens",
  //   longDescription: "Sourced from organic gardens nestled in the Himalayas, this green tea offers a pure, authentic taste. The high altitude and pristine environment produce leaves with exceptional clarity and a subtle, refreshing character with notes of fresh vegetables and spring meadows.",
  //   price: 1799,
  //   image: "https://images.unsplash.com/photo-1627435601361-ec25f5b1d0e5?w=800&q=80",
  //   images: [
  //     "https://images.unsplash.com/photo-1627435601361-ec25f5b1d0e5?w=800&q=80",
  //   ],
  //   category: "Green Tea",
  //   tags: ["organic", "high-altitude", "pure"],
  //   weight: "100g",
  //   inStock: true,
  //   rating: 4.6,
  //   reviews: 89,
  // },
  // {
  //   id: "white-moonlight",
  //   name: "White Moonlight",
  //   description: "Rare white tea with silvery buds, delicate and naturally sweet",
  //   longDescription: "Our White Moonlight tea represents the pinnacle of tea craftsmanship. Made from tender, silver-tipped buds harvested at dawn, this rare white tea offers an ethereal, naturally sweet flavor with hints of melon and honey. A true luxury for the discerning tea lover.",
  //   price: 3499,
  //   originalPrice: 3999,
  //   image: "https://images.unsplash.com/photo-1558160074-4d7d8bdf4256?w=800&q=80",
  //   images: [
  //     "https://images.unsplash.com/photo-1558160074-4d7d8bdf4256?w=800&q=80",
  //   ],
  //   category: "White Tea",
  //   tags: ["rare", "premium", "limited-edition"],
  //   weight: "50g",
  //   inStock: true,
  //   isFeatured: true,
  //   isNew: true,
  //   rating: 5.0,
  //   reviews: 42,
  // },
  // {
  //   id: "tulsi-herbal-blend",
  //   name: "Tulsi Wellness Blend",
  //   description: "Caffeine-free holy basil blend with natural healing properties",
  //   longDescription: "This therapeutic blend features sacred Tulsi (Holy Basil), revered in Ayurveda for its adaptogenic properties. Combined with hints of lemongrass and ginger, this caffeine-free infusion supports relaxation and overall wellness while delivering a soothing, herbaceous flavor.",
  //   price: 1299,
  //   image: "https://images.unsplash.com/photo-1597318181409-cf64d0b5d8a2?w=800&q=80",
  //   images: [
  //     "https://images.unsplash.com/photo-1597318181409-cf64d0b5d8a2?w=800&q=80",
  //   ],
  //   category: "Herbal Tea",
  //   tags: ["caffeine-free", "ayurvedic", "wellness"],
  //   weight: "100g",
  //   inStock: true,
  //   rating: 4.7,
  //   reviews: 78,
  // },
  // {
  //   id: "oolong-himalayan",
  //   name: "Himalayan Oolong",
  //   description: "Semi-oxidized tea with complex floral and fruity notes",
  //   longDescription: "This artisanal Himalayan Oolong represents the perfect balance between green and black tea. Carefully processed to achieve optimal oxidation, it delivers a complex cup with layers of floral, fruity, and slightly roasted notes that evolve beautifully across multiple infusions.",
  //   price: 2899,
  //   image: "https://images.unsplash.com/photo-1564890369478-c89ca6d9cde9?w=800&q=80",
  //   images: [
  //     "https://images.unsplash.com/photo-1564890369478-c89ca6d9cde9?w=800&q=80",
  //   ],
  //   category: "Oolong Tea",
  //   tags: ["artisanal", "complex", "multi-infusion"],
  //   weight: "75g",
  //   inStock: true,
  //   isFeatured: true,
  //   rating: 4.8,
  //   reviews: 56,
  // },
  // {
  //   id: "earl-grey-supreme",
  //   name: "Earl Grey Supreme",
  //   description: "Premium black tea with natural bergamot and blue cornflowers",
  //   longDescription: "Our Earl Grey Supreme elevates the classic blend with exceptional ingredients. We combine select Darjeeling leaves with pure bergamot oil and delicate blue cornflowers to create a sophisticated, aromatic tea that's perfect for afternoon indulgence.",
  //   price: 1599,
  //   image: "https://images.unsplash.com/photo-1594631252845-29fc4cc8cde9?w=800&q=80",
  //   images: [
  //     "https://images.unsplash.com/photo-1594631252845-29fc4cc8cde9?w=800&q=80",
  //   ],
  //   category: "Flavored Tea",
  //   tags: ["classic", "aromatic", "afternoon-tea"],
  //   weight: "100g",
  //   inStock: true,
  //   rating: 4.6,
  //   reviews: 112,
  // },
  // {
  //   id: "chamomile-dreams",
  //   name: "Chamomile Dreams",
  //   description: "Pure chamomile flowers for a calming, relaxing experience",
  //   longDescription: "Hand-picked Egyptian chamomile flowers create this soothing, caffeine-free infusion. Known for its calming properties, this gentle tea features sweet, apple-like notes perfect for unwinding before bed or during moments of quiet reflection.",
  //   price: 1199,
  //   image: "https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=800&q=80",
  //   images: [
  //     "https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=800&q=80",
  //   ],
  //   category: "Herbal Tea",
  //   tags: ["caffeine-free", "calming", "bedtime"],
  //   weight: "75g",
  //   inStock: true,
  //   rating: 4.5,
  //   reviews: 89,
  // },
  // {
  //   id: "jasmine-pearl",
  //   name: "Jasmine Pearl",
  //   description: "Hand-rolled green tea pearls scented with fresh jasmine blossoms",
  //   longDescription: "Each pearl is hand-rolled from tender green tea leaves and naturally scented multiple times with fresh jasmine flowers. As the pearls unfurl in hot water, they release an intoxicating floral aroma and a smooth, sweet taste that lingers beautifully.",
  //   price: 2299,
  //   image: "https://images.unsplash.com/photo-1571934811356-5cc061b6821f?w=800&q=80",
  //   images: [
  //     "https://images.unsplash.com/photo-1571934811356-5cc061b6821f?w=800&q=80",
  //   ],
  //   category: "Green Tea",
  //   tags: ["scented", "artisanal", "floral"],
  //   weight: "75g",
  //   inStock: true,
  //   isNew: true,
  //   rating: 4.9,
  //   reviews: 67,
  // },
];

// export const categories = [
//   { id: "black-tea", name: "Black Tea", count: 3 },
//   { id: "green-tea", name: "Green Tea", count: 2 },
//   { id: "white-tea", name: "White Tea", count: 1 },
//   // { id: "oolong-tea", name: "Oolong Tea", count: 1 },
//   { id: "chai-blends", name: "Chai Blends", count: 1 },
//   { id: "herbal-tea", name: "Herbal Tea", count: 2 },
//   { id: "specialty-tea", name: "Specialty Tea", count: 1 },
//   { id: "flavored-tea", name: "Flavored Tea", count: 1 },
// ];

export const getProductById = (id: string): Product | undefined => {
  return products.find((product) => product.id === id);
};

export const getProductsByCategory = (category: string): Product[] => {
  return products.filter(
    (product) => product.category.toLowerCase().replace(/\s+/g, "-") === category
  );
};

export const getBestsellers = (): Product[] => {
  return products.filter((product) => product.isBestseller);
};

export const getFeaturedProducts = (): Product[] => {
  return products.filter((product) => product.isFeatured);
};

export const getNewProducts = (): Product[] => {
  return products.filter((product) => product.isNew);
};
