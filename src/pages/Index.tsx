import { Hero } from '@/components/home/Hero';
import { Bestsellers } from '@/components/home/Bestsellers';
import { FeaturedProducts } from '@/components/home/FeaturedProducts';
import { ShopByCategory } from '@/components/home/ShopByCategory';
import { AboutPreview } from '@/components/home/AboutPreview';
import { WhyChoose } from '@/components/home/WhyChoose';
import { CustomerReviews } from '@/components/home/CustomerReviews';
import { BulkOrdersTeaser } from '@/components/home/BulkOrdersTeaser';
import { Newsletter } from '@/components/home/Newsletter';

const Index = () => {
  return (
    <>
      <Hero />
      <Bestsellers />
      <ShopByCategory />
      <FeaturedProducts />
      <AboutPreview />
      <WhyChoose />
      <CustomerReviews />
      <BulkOrdersTeaser />
      <Newsletter />
    </>
  );
};

export default Index;
